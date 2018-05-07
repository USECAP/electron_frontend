import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/filter';
import {ElectronTransport, Transport} from './transport';
import {Project} from './models/project';
import {Stats} from 'fs';
import {FuzzingResult, ScanResult} from './models/results';
import {Checkers} from './models/checkers';

class PingMessage {
  message: string;

  constructor(data) {
    this.message = data.message;
  }

  formatMessage(): string {
    return `hello, ${this.message}`;
  }
}

@Injectable()
export class BackendService {
  private transport: Transport;

  constructor(transport?: Transport) {
    this.transport = transport;
    if (!this.transport) {
      this.transport = new ElectronTransport();
    }
  }

  ping(): Observable<PingMessage> {
    return this.transport.call('ping').map(value => new PingMessage(value));
  }

  stat(path: string): Observable<Stats> {
    return this.transport.call('stat', [path]);
  }

  readDir(path: string): Observable<string[]> {
    return this.transport.call('readDir', [path]);
  }

  readFile(path: string): Observable<string> {
    return this.transport.call('readFile', [path]);
  }

  storeState(state: object): Observable<void> {
    return this.transport.call('storeState', [state]);
  }

  loadState(): Observable<object> {
    return this.transport.call('loadState');
  }

  scanProject(project: Project, checkers: string[]): Observable<ScanResult> {
    return this.transport.call('scanProject', [{
      project: {
        name: project.name,
        location: project.location,
        buildSystem: project.buildSystem,
        buildCommand: project.buildCommand
      },
      checkers: checkers
    }]).map(value => new ScanResult(checkers, value));
  }

  runFuzzTarget(project: Project, targetName: string, targetCode: string): Observable<FuzzingResult> {
    return this.transport.call('runFuzzTarget', [{
      project: {
        name: project.name,
        location: project.location,
        buildSystem: project.buildSystem,
        fuzzTarget: {name: targetName, code: targetCode}
      }
    }]).map(value => new FuzzingResult(targetName, targetCode, value));
  }

  stopScan(project: Project): Observable<ScanResult> {
    return this.transport.call('stopScan', [{
      project: {
        name: project.name
      }
    }]).map(value => new ScanResult(value));
  }

  stopFuzzing(project: Project, targetName: string, targetCode: string): Observable<FuzzingResult> {
    return this.transport.call('stopFuzzing', [{
      project: {
        name: project.name
      }
    }]).map(value => new FuzzingResult(targetName, targetCode, value));
  }

  getCheckers(): Observable<Checkers> {
    return this.transport.call('getCheckersInfo', [])
      .map(value => value ? value.logs : '\n')
      .filter(logs => logs !== '\n')
      .reduce((info, log) => info + log)
      .map(info => new Checkers(info));
  }
}
