'use strict';

const http = require('http');
const WebSocket = require('ws');
const which = require('which');
const {spawnSync} = require('child_process');
const {CheckersInfoHandler, FuzzHandler, ScanHandler, StopHandler} = require("./handler");


class BackendServer {
  constructor() {
    BackendServer.ensureCiToolsAreFound();
    this.handlers = new Map();
  }

  static ensureCiToolsAreFound(force) {
    process.env.PATH = `${process.env.PATH}:${process.env.HOME}/.local/bin`;
    const ciBuildFound = which.sync('ci-build', {nothrow: true});
    const ciVulnscanFound = which.sync('ci-vulnscan', {nothrow: true});
    if (force === true || !ciBuildFound || !ciVulnscanFound) {
      const res = spawnSync('pip3', ['install', '--user', '-U', '-e', '.'], {
        cwd: '../ci-tools'
      });
      if (res.error) {
        console.log(res.error.toString());
        throw res.error;
      }
      if (res.stderr) {
        console.error(res.stderr.toString());
      }
    }
  }

  serve() {
    return new Promise(resolve => {
      const httpServer = http.createServer();
      httpServer.listen(0);
      httpServer.on('listening', () => {
        const wss = new WebSocket.Server({server: httpServer});
        wss.on('connection', (connection) => {
          console.log(`new connection`);
          connection.on('message', (data) => {
            console.log('received: %s', data);
            const msg = JSON.parse(data);
            this._handle(connection, msg);
          });
        });
        console.log(`Listening on ${httpServer.address().port}`);
        resolve(httpServer.address().port);
      })
    });
  }

  _handle(connection, msg) {
    const scanParams = msg.parameters[0];
    const project = scanParams ? scanParams.project : undefined;
    switch (msg.method) {
      case 'scanProject': {
        let scanHandler = new ScanHandler(connection, msg.id);
        this.handlers[['vulnscan', project.name]] = scanHandler;
        scanHandler.handle(scanParams, () => {
          this.handlers.delete(['vulnscan', project.name]);
        });
        return;
      }
      case 'runFuzzTarget': {
        let fuzzHandler = new FuzzHandler(connection, msg.id);
        this.handlers[['ci-fuzz', project.name]] = fuzzHandler;
        fuzzHandler.handle(scanParams, () => {
          this.handlers.delete(['ci-fuzz', project.name]);
        });
        return;
      }
      case 'getCheckersInfo': {
        let checkersHandler = new CheckersInfoHandler(connection, msg.id);
        checkersHandler.handle(scanParams);
        return;
      }
      case 'stopScan': {
        const key = ['vulnscan', project.name];
        const target = this.handlers[key];
        let stopHandler = new StopHandler(connection, msg.id);
        stopHandler.handle(target, (stopped) => {
          if (stopped) {
            this.handlers.delete(key);
          }
        });
        return;
      }
      case 'stopFuzzing': {
        const key = ['ci-fuzz', project.name];
        const target = this.handlers[key];
        let stopHandler = new StopHandler(connection, msg.id);
        stopHandler.handle(target, (stopped) => {
          if (stopped) {
            this.handlers.delete(key);
          }
        });
        return;
      }
      default: {
        return;
      }
    }
  }
}

module.exports = {BackendServer};
