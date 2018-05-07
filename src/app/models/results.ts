'use strict';

/**
 * The scan class captures all information about one scan.
 */
import 'rxjs/add/operator/defaultIfEmpty';
import {Vulnerability} from './vulnerability';
import {v1 as uuid} from 'uuid';

export enum ResultsStatus {
  BUILDING = 'BUILDING',
  READY = 'READY',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  ABORTED = 'ABORTED',
  COMPLETE = 'COMPLETE'
}


export class Result {
  status: ResultsStatus;
  logs: string;
  vulnerabilities: Vulnerability[];
  uuid: string;

  constructor(resultJSON?) {
    this.uuid = uuid();
    this.vulnerabilities = [];
    if (!resultJSON) {
      this.status = ResultsStatus.READY;
      this.logs = '';
    } else {
      this.status = resultJSON.status;
      this.logs = resultJSON.logs;
      for (const vulnerabilityJSON of resultJSON.vulnerabilities) {
        this.vulnerabilities.push(new Vulnerability(vulnerabilityJSON));
      }
    }
  }
}

export class ScanResult extends Result {

  constructor(public checkers: string[], scanResultJSON?) {
    super(scanResultJSON);
  }
}

export class FuzzingResult extends Result {

  constructor(public name, public code: string, fuzzResultJSON?) {
    super(fuzzResultJSON);
  }
}

/**
 * Merge two results
 * @param {Result} oldResult
 * @param {Result} newResult
 * @returns {Result}
 */
function mergeResults(oldResult: Result, newResult: Result): Result {
  return <Result>{
    status: newResult.status,
    logs: `${oldResult.logs}${oldResult.logs ? '\n' : ''}${newResult.logs}`,
    vulnerabilities: oldResult.vulnerabilities.concat(newResult.vulnerabilities),
    uuid: oldResult.uuid
  };
}

/**
 * Merge two scan results
 * @param {ScanResult} oldResult
 * @param {ScanResult} newResult
 * @returns {ScanResult}
 */

export function mergeScanResults(oldResult: ScanResult, newResult: ScanResult): ScanResult {
  const result = mergeResults(oldResult, newResult) as ScanResult;
  result.checkers = oldResult.checkers;
  return result;
}

/**
 * Merge two fuzzing results
 * @param {FuzzingResult} oldResult
 * @param {FuzzingResult} newResult
 * @returns {FuzzingResult}
 */

export function mergeFuzzingResults(oldResult: FuzzingResult, newResult: FuzzingResult): FuzzingResult {
  const result = mergeResults(oldResult, newResult) as FuzzingResult;
  result.code = oldResult.code;
  result.name = oldResult.name;
  return result;
}

