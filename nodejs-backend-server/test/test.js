'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const {BackendServer} = require('../src/server');
const {CheckersInfoHandler, FuzzHandler, ScanHandler} = require('../src/handler');
const fs = require('fs');
const path = require('path');

function deleteSync(link) {
  if (fs.existsSync(link)) {
    if (fs.lstatSync(link).isDirectory()) {
      fs.readdirSync(link).forEach((file) => {
        deleteSync(path.join(link, file));
      });
      fs.rmdirSync(link);
    } else {
      fs.unlinkSync(link);
    }
  }
}

function copySync(src, dest) {
  if (fs.existsSync(src)) {
    if (fs.lstatSync(src).isDirectory()) {
      fs.mkdirSync(dest);
      fs.readdirSync(src).forEach((file) => {
        copySync(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.linkSync(src, dest);
    }
  }
}

class FileSaver {
  constructor(relativeDirectoryPath, fileNames) {
    this.directotyPath = path.join(process.cwd(), relativeDirectoryPath);
    this.saveDirectoryPath = this.directotyPath + '.save';
    this.fileNames = fileNames;
  }

  save() {
    if (!fs.existsSync(this.saveDirectoryPath)) {
      fs.mkdirSync(this.saveDirectoryPath);
      if (fs.lstatSync(this.saveDirectoryPath).isDirectory()) {
        for (let fileName of this.fileNames) {
          const src = path.join(this.directotyPath, fileName);
          const dest = path.join(this.saveDirectoryPath, fileName);
          if (fs.existsSync(src)) {
            fs.linkSync(src, dest);
          }
        }
      }
    }
  }

  restore() {
    deleteSync(this.directotyPath);
    copySync(this.saveDirectoryPath, this.directotyPath);
  }

  cleanup() {
    deleteSync(this.saveDirectoryPath);
  }
}


before(function (done) {
  this.timeout(0);
  BackendServer.ensureCiToolsAreFound(true);
  done();
});

describe('Server', () => {
  it('should create', () => {
    expect(() => new BackendServer()).to.not.throw();
  });
});


describe('Handler', function () {
  let fileSavers;
  let connection;

  let initFileSavers = function () {
    fileSavers = {
      'test/data/autotools_project': new FileSaver('test/data/autotools_project', ['configure.ac', 'main.c', 'Makefile.am']),
      'test/data/cmake_project':     new FileSaver('test/data/cmake_project', ['CMakeLists.txt', 'main.c']),
      'test/data/make_project':      new FileSaver('test/data/make_project', ['main.c', 'main.h', 'Makefile']),
      'test/data/fuzz_project':      new FileSaver('test/data/fuzz_project', ['fuzzme.c', 'fuzzme.h', 'Makefile'])
    };
  };

  before(function (done) {
    this.timeout(0);
    initFileSavers();
    Object.values(fileSavers).forEach(v => v.save());
    done();
  });

  beforeEach(function () {
    connection = {
      send: sinon.stub()
    };
  });

  afterEach(function () {
    if (this.currentTest.pathToTestFiles) {
      fileSavers[this.currentTest.pathToTestFiles].restore();
    }
  });

  after(() => {
    Object.values(fileSavers).forEach(v => v.cleanup());
  });

  it('should handle #scanProject with wrong parameters', () => {
    const handler = new ScanHandler(connection, 13);
    handler.handle();
    expect(connection.send.callCount).to.equal(1);
    const msg = JSON.parse(connection.send.firstCall.args[0]);
    expect(msg.id).to.equal(13);
    expect(msg.completed).to.equal(true);
    expect(msg.error.code).to.equal(-32600);
  });

  it('should handle #scanProject with invalid path', function (done) {
    this.timeout(10000);
    const scanParams = {
      project: {
        name: 'test-project',
        location: 'test/data/invalid/path'
      },
      checkers: []
    };
    const handler = new ScanHandler(connection, 7);
    handler.handle(scanParams, () => {
      const msg = JSON.parse(connection.send.lastCall.args[0]);
      expect(msg.completed).to.equal(true);
      expect(msg.error).to.not.be.empty;
      done();
    });
  });


  it('should handle #scanProject on autotools project', function (done) {
    this.timeout(20000);
    this.test.pathToTestFiles = 'test/data/autotools_project';
    const scanParams = {
      project: {
        name: 'test-project',
        location: this.test.pathToTestFiles,
        buildSystem: 'autotools'
      },
      checkers: []
    };
    const handler = new ScanHandler(connection, 42);
    handler.handle(scanParams, () => {
      const msg = JSON.parse(connection.send.lastCall.args[0]);
      expect(msg.id).to.equal(42);
      expect(msg.completed).to.equal(true);
      expect(msg.result.vulnerabilities).to.not.be.empty;
      done();
    });
  });

  it('should handle #scanProject on cmake project', function (done) {
    this.timeout(10000);
    this.test.pathToTestFiles = 'test/data/cmake_project';
    const scanParams = {
      project: {
        name: 'test-project',
        location: this.test.pathToTestFiles,
        buildSystem: 'cmake'
      },
      checkers: []
    };
    const handler = new ScanHandler(connection, 42);
    handler.handle(scanParams, () => {
      const msg = JSON.parse(connection.send.lastCall.args[0]);
      expect(msg.id).to.equal(42);
      expect(msg.completed).to.equal(true);
      expect(msg.result.vulnerabilities).to.not.be.empty;
      done();
    });
  });

  it('should handle #scanProject on make project', function (done) {
    this.timeout(10000);
    this.test.pathToTestFiles = 'test/data/make_project';
    const scanParams = {
      project: {
        name: 'test-project',
        location: this.test.pathToTestFiles,
        buildSystem: 'make'
      },
      checkers: []
    };
    const handler = new ScanHandler(connection, 42);
    handler.handle(scanParams, () => {
      const msg = JSON.parse(connection.send.lastCall.args[0]);
      expect(msg.id).to.equal(42);
      expect(msg.completed).to.equal(true);
      expect(msg.result.vulnerabilities).to.not.be.empty;
      done();
    });
  });

  it('should handle #scanProject on make project with custom build command', function (done) {
    this.timeout(10000);
    this.test.pathToTestFiles = 'test/data/make_project';
    const scanParams = {
      project: {
        name: 'test-project',
        location: this.test.pathToTestFiles,
        buildSystem: 'custom',
        buildCommand: 'make'
      },
      checkers: []
    };
    const handler = new ScanHandler(connection, 42);
    handler.handle(scanParams, () => {
      const msg = JSON.parse(connection.send.lastCall.args[0]);
      expect(msg.id).to.equal(42);
      expect(msg.completed).to.equal(true);
      expect(msg.result.vulnerabilities).to.not.be.empty;
      done();
    });
  });

  it('should handle #runFuzzTarget', function (done) {
    this.timeout(100000);
    this.test.pathToTestFiles = 'test/data/fuzz_project';
    const scanParams = {
      project: {
        name: 'test-fuzz-project',
        location: this.test.pathToTestFiles,
        buildSystem: 'make',
        fuzzTarget: {
          name: 'target',
          code: `
            #include <stdint.h>
            #include <stddef.h>
            extern "C" {
              #include "fuzzme.h"
            }
            extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
              FuzzMe(Data, Size);
              return 0;
            }`
        }
      }
    };
    const handler = new FuzzHandler(connection, 11886);
    handler.handle(scanParams, () => {
      const msg = JSON.parse(connection.send.lastCall.args[0]);
      expect(msg.id).to.equal(11886);
      expect(msg.completed).to.equal(true);
      expect(msg.result.vulnerabilities.length).to.equal(1);
      expect(msg.result.vulnerabilities[0].category).to.equal('Memory error');
      done();
    });
  });

  it('should stop handling #scanProject on autotools project', function (done) {
    this.timeout(10000);
    this.test.pathToTestFiles = 'test/data/autotools_project';
    const scanParams = {
      project: {
        name: 'test-project',
        location: this.test.pathToTestFiles,
        buildSystem: 'autotools'
      },
      checkers: []
    };
    const handler = new ScanHandler(connection, 42);
    handler.handle(scanParams);

    handler.stop(() => {
      const msg = JSON.parse(connection.send.lastCall.args[0]);
      expect(msg.id).to.equal(42);
      expect(msg.completed).to.equal(true);
      expect(msg.result.vulnerabilities).to.be.empty;
      done();
    });
  });

  it('should stop handling #scanProject on autotools project after 1 second', function (done) {
    this.timeout(2000);
    this.test.pathToTestFiles = 'test/data/autotools_project';
    const scanParams = {
      project: {
        name: 'test-project',
        location: this.test.pathToTestFiles,
        buildSystem: 'autotools'
      },
      checkers: []
    };
    const handler = new ScanHandler(connection, 42);
    handler.handle(scanParams);

    setTimeout(function () {
      handler.stop(() => {
        const msg = JSON.parse(connection.send.lastCall.args[0]);
        expect(msg.id).to.equal(42);
        expect(msg.completed).to.equal(true);
        expect(msg.result.vulnerabilities).to.be.empty;
        done();
      });
    }, 1000);
  });

  it('should stop handling #scanProject on autotools project after 5 seconds', function (done) {
    this.timeout(6000);
    this.test.pathToTestFiles = 'test/data/autotools_project';
    const scanParams = {
      project: {
        name: 'test-project',
        location: this.test.pathToTestFiles,
        buildSystem: 'autotools'
      },
      checkers: []
    };
    const handler = new ScanHandler(connection, 42);
    handler.handle(scanParams);

    setTimeout(function () {
      handler.stop(() => {
        const msg = JSON.parse(connection.send.lastCall.args[0]);
        expect(msg.id).to.equal(42);
        expect(msg.completed).to.equal(true);
        expect(msg.result.vulnerabilities).to.be.empty;
        done();
      });
    }, 5000);
  });

  it('should receive checkers list', function (done) {
    this.timeout(10000);
    const handler = new CheckersInfoHandler(connection, 42);
    handler.handle(() => {
      done();
    });
  });
});
