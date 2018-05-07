'use strict';

const fs = require('fs');
const createOutputStream = require('create-output-stream');
const {spawn} = require('child_process');
const Promise = require('bluebird');
const {Sender} = require('./sender');

Promise.config({
  cancellation: true,
});

const ResultsStatus = Object.freeze({
  BUILDING: 'BUILDING',
  READY: 'READY',
  RUNNING: 'RUNNING',
  FAILED: 'FAILED',
  ABORTED: 'ABORTED',
  COMPLETE: 'COMPLETE'
});


/**
 * Factory that provides the default build scripts for some common build tools.
 */
class BuildCommandFactory {
  /**
   * Create a build script for the projects build system.
   * @param project
   * @returns {string}
   */
  static createFor(project) {
    const shebangLine = "#!/usr/bin/env bash\n\n";

    const commands = {
      'custom': project.buildCommand,
      'cmake': 'mkdir -p build && cd build && cmake .. && make',
      'autotools': 'autoreconf -ivf && ./configure && make',
      'make': 'make'
    };
    const command = commands[project.buildSystem] || '';
    return shebangLine + command + "\n";
  }
}

/**
 * Factory that provides a Promise for spawning child processes. The Promise
 * executes a spawning action. On success or failure, it first calls the
 * provided callbacks and then resolve or reject, accordingly. The success,
 * failure and cancel callbacks should only handle logging or similar actions
 * that do not infer with the concept of Promise chaining. The promise can be
 * canceled, which kills the child and grandchild processes.
 *
 * @param visitor visitor that references the handler and project
 * @param action the spawning action
 * @param successLog callback for logging on success
 * @param failureLog callback for logging on failure
 * @param options optional parameters
 * @returns bluebird Promise for spawning child processes
 */
function spawningPromise(visitor, action, successLog, failureLog, options = {}) {
  const expectedReturnCode = (options.expectedReturnCode) ? options.expectedReturnCode : 0;
  return new Promise((resolve, reject, onCancel) => {
    const child = action();
    child.on('close', (code) => {
      if (code !== expectedReturnCode) {
        failureLog(code);
        reject(new Error(code));
      }
      else {
        successLog(code);
        resolve(visitor);
      }
    });
    onCancel(() => {
      try {
        // Negative number: also kill grandchildren. No zombies left behind!
        process.kill(-child.pid, 'SIGTERM');
        process.kill(-child.pid, 'SIGKILL');
      }
      catch (err) {
        visitor.handler.error(`Error at stopping: ${err}`);
      }
    });
  });
}

/**
 * Factory that provides a Promise for outputting files. The Promise executes
 * runs an write stream. On success or failure, it first calls the provided
 * callbacks and then resolve or reject, accordingly. The success and failure
 * callbacks should only handle logging or similar actions that do not infer
 * with the concept of Promise chaining. The visitor shall contain information
 * on the appropriate handler and project. The promise can be canceled, which
 * closes the write stream.
 *
 * @param file the file path
 * @param content the file content
 * @param successLog callback for logging on success
 * @param failureLog callback for logging on failure
 * @param visitor visitor that references the handler and project
 * @returns bluebird Promise for spawning child processes
 */
function fileOutputtingPromise(file, content, successLog, failureLog, visitor) {
  return new Promise((resolve, reject, onCancel) => {
    const writeStream = createOutputStream(file);
    let canceled = false;
    writeStream.on('finish', () => {
      if (canceled) {
        reject('Writing the file was canceled.');
      }
      successLog();
      resolve(visitor);
    });
    writeStream.on('error', (err) => {
      failureLog(err);
      reject(err);
    });
    onCancel(() => {
      canceled = true;
      writeStream.close();
    });
    writeStream.write(content);
    writeStream.end();
  });
}

/**
 * Base class for handlers that handle ci-tools.
 */
class Handler {
  constructor(connection, msgId) {
    if (!connection || !msgId) {
      throw new Error('Handler needs a connection and a message ID.');
    }
    this.sender = new Sender(connection, msgId, this);
    this.promise = Promise.resolve();
    this.status = ResultsStatus.READY;
  }

  handle(params, callback) {
    // abstract
  }

  /**
   * Optional method that stops the handler's action. Should only be called
   * from a StopHandler in order to correctly handle the messages to the
   * front-end.
   *
   * @param callback
   */
  stop(callback) {
    // abstract
  }

  spawnChmod(project) {
    return this.spawnAndListen('chmod', ['+x', (Handler.getPathForBuildScript(project))]);
  }

  spawnCiBuild(project, buildCommand, options = []) {
    if (project) {
      options.push('--project-path', project.location);
    }
    this.status = ResultsStatus.BUILDING;
    return this.spawnAndListen('ci-build', ['-v', ...options, buildCommand]);
  }

  spawnCiVulnscan(project, options = []) {
    if (project) {
      options.push('--project-path', project.location);
    }
    this.status = ResultsStatus.RUNNING;
    return this.spawnAndListen('ci-vulnscan', ['-v', ...options]);
  }

  spawnCiFuzz(project, options = []) {
    if (project) {
      options.push('--project-path', project.location);
    }
    this.status = ResultsStatus.RUNNING;
    // console.log('ci-fuzz', [...options, project.fuzzTarget.name]);
    return this.spawnAndListen('ci-fuzz', [...options, project.fuzzTarget.name]);
  }

  sendStopReport(logs, doneCallback) {
    doneCallback = doneCallback ? doneCallback : () => void 0;
    this.status = ResultsStatus.ABORTED;
    this.sender.sendStopLogs(logs);
    doneCallback();
  }

  spawnAndListen(command, args = [], options = {}) {
    options['detached'] = true;
    // console.log(`spawning ${command} ${args.join(' ')}`);
    const process = spawn(command, args, options);
    this.sender.sendDataFromStream(process.stdout);
    this.sender.sendDataFromStream(process.stderr);
    return process;
  }

  log(logs) {
    this.sender.sendLogs(logs);
  }

  error(message) {
    this.status = ResultsStatus.FAILED;
    message = message instanceof Error ? message.toString() : message;
    this.sender.sendError(message);
  }

  vulnerabilities(data) {
    this.status = ResultsStatus.COMPLETE;
    this.sender.sendVulnerabilities('', JSON.parse(data));
  }

  static getPathForBuildScript(project) {
    return project.location + "/build.sh";
  }

  static outputBuildScript(visitor) {
    const {handler, project} = visitor;
    return fileOutputtingPromise(
      Handler.getPathForBuildScript(project),
      BuildCommandFactory.createFor(project),
      () => handler.log(`Writing the build script finished.\n`),
      (err) => handler.error(`Writing the build script finished with an error: ${err}\n`),
      visitor
    );
  }

  static chmodBuildScript(visitor) {
    const {handler, project} = visitor;
    return spawningPromise(
      visitor,
      () => handler.spawnChmod(project),
      (code) => handler.log(`Changing the access right of the build script finished with code ${code}.\n`),
      (code) => handler.error(`Changing the access right of the build script finished with code ${code}.\n`)
    );
  }

  static ciBuild(visitor, description = undefined, options = []) {
    const {handler, project} = visitor;
    description = description ? ' on ' + description : '';
    return spawningPromise(
      visitor,
      () => handler.spawnCiBuild(project, './build.sh', options),
      (code) => handler.log(`Running ci-build${description} finished with code ${code}.\n`),
      (code) => handler.error(`Running ci-build${description} finished with code ${code}.\n`)
    );
  }

  static vulnscan(visitor, options = []) {
    const {handler, project} = visitor;
    return spawningPromise(
      visitor,
      () => handler.spawnCiVulnscan(project, options),
      (code) => handler.log(`Running vulnscan finished with code ${code}.\n`),
      (code) => handler.error(`Running vulnscan finished with code ${code}.\n`)
    );
  }

  static outputFuzzingTarget(visitor) {
    const {handler, project} = visitor;
    return fileOutputtingPromise(
      FuzzHandler.getPathForFuzzingTarget(project),
      project.fuzzTarget.code,
      () => handler.log(`Writing the fuzzing target finished.\n`),
      (err) => handler.error(`Writing the fuzzing target finished with an error: ${err}\n`),
      visitor
    );
  }

  static ciFuzzTarget(visitor) {
    const {handler, project} = visitor;
    return spawningPromise(
      visitor,
      () => handler.spawnCiFuzz(project),
      (code) => handler.log(`Running ci-fuzz finished with code ${code}.\n`),
      (code) => handler.error(`Running ci-fuzz finished with code ${code}.\n`),
      {expectedReturnCode: 1}
    );
  }

  static sendReports(visitor, reportName) {
    const {handler, project} = visitor;
    return new Promise((resolve, reject) => {
      fs.readFile(`${project.location}/${reportName}.json`, (err, data) => {
        if (err) {
          handler.error(`Reading the results finished with an error: ${err}\n`);
          reject(err);
        } else {
          handler.vulnerabilities(data);
          resolve(visitor);
        }
      });
    });
  }

  static complete(visitor) {
    const {handler, project} = visitor;
    return new Promise((resolve, reject) => {
      handler.status = ResultsStatus.COMPLETE;
      handler.sender.sendStopLogs();
      resolve(visitor);
    });
  }
}

/**
 * A handler that builds and scans a project using ci-build and vulnscan.
 */
class ScanHandler extends Handler {
  constructor(connection, msgId) {
    super(connection, msgId);
  }

  /**
   * Builds and scans the project.
   *
   * @param params the parameters
   * @param doneCallback callback
   */
  handle(params, doneCallback) {
    doneCallback = doneCallback ? doneCallback : () => void 0;

    this.status = ResultsStatus.BUILDING;
    if (!params || !params.project) {
      this.status = ResultsStatus.FAILED;
      this.sender.sendInvalidRequest();
      doneCallback();
      return;
    }

    this.promise.cancel();
    this.promise = Promise.resolve({handler: this, project: params.project})
      .then(Handler.outputBuildScript)
      .then(Handler.chmodBuildScript)
      .then(visitor => Handler.ciBuild(visitor, 'the project'))
      .then(Handler.vulnscan)
      .then(visitor => Handler.sendReports(visitor, 'ci-report'))
      .catch((err) => this.error(err))
      .finally(doneCallback);
  }

  stop(doneCallback) {
    this.promise.cancel();
    this.sendStopReport('Scanning was stopped.\n', doneCallback);
  }
}

/**
 * A handler that builds and fuzzes a project using ci-build and ci-fuzz.
 */
class FuzzHandler extends Handler {
  constructor(connection, msgId) {
    super(connection, msgId);
  }

  /**
   * Builds and fuzzes the project.
   *
   * @param params the parameters
   * @param doneCallback callback
   */
  handle(params, doneCallback) {
    doneCallback = doneCallback ? doneCallback : () => void 0;

    this.status = ResultsStatus.BUILDING;
    if (!params || !params.project) {
      this.status = ResultsStatus.FAILED;
      this.sender.sendInvalidRequest();
      doneCallback();
      return;
    }

    const project = params.project;
    this.promise.cancel();
    this.promise = Promise.resolve({handler: this, project: project})
      .then(Handler.outputBuildScript)
      .then(Handler.chmodBuildScript)
      .then(Handler.outputFuzzingTarget)
      .then(visitor => Handler.ciBuild(visitor, 'the project', ['--sanitize-build']))
      .then(visitor => Handler.ciBuild(visitor, 'the fuzz target', ['--fuzzing-targets']))
      .then(Handler.ciFuzzTarget)
      .then(visitor => Handler.sendReports(visitor, 'ci-fuzzing-targets/ci-report'))
      .catch((err) => this.error(err))
      .finally(doneCallback);
  }

  stop(doneCallback) {
    this.promise.cancel();
    this.sendStopReport('Fuzzing was stopped.\n', doneCallback);
  }

  static getPathForFuzzingTarget(project) {
    return project.location + '/ci-fuzzing-targets/' + project.fuzzTarget.name + '.cc';
  }
}


/**
 * A handler that returns the checks information of vulnscan.
 */
class CheckersInfoHandler extends Handler {
  constructor(connection, msgId) {
    super(connection, msgId);
  }

  /**
   * Calls vulnscan with the '--help-checkers-verbose' option.
   *
   * @param doneCallback callback
   */
  handle(doneCallback) {
    doneCallback = doneCallback ? doneCallback : () => void 0;

    this.promise.cancel();
    this.promise = Promise.resolve({handler: this})
      .then(visitor => Handler.vulnscan(visitor, ['--help-checkers-verbose']))
      .then(Handler.complete)
      .catch((err) => this.error(err))
      .finally(doneCallback);
  }

  stop(doneCallback) {
    throw new Error('CheckersInfoHandler cannot be stopped.\n');
  }
}


/**
 * A handler that stops another handler.
 */
class StopHandler extends Handler {
  constructor(connection, msgId) {
    super(connection, msgId);
  }

  /**
   * Stops the targeted handler.
   *
   * @param target the handler to be stopped
   * @param doneCallback callback
   */
  handle(target, doneCallback) {
    doneCallback = doneCallback ? doneCallback : () => void 0;
    if (!target) {
      this.status = ResultsStatus.FAILED;
      this.sender.sendInvalidRequest();
      doneCallback(false);
      return;
    }

    target.stop(() => {
      this.status = ResultsStatus.COMPLETE;
      this.sender.sendStopLogs('Stopping was successful.\n');
      doneCallback(true);
    });
  }

  /**
   * Cannot be stopped.
   *
   * @param doneCallback
   */
  stop(doneCallback) {
    throw new Error('StopHandler cannot be stopped.\n');
  }
}

module.exports = {CheckersInfoHandler, FuzzHandler, ScanHandler, StopHandler};
