import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs/Observable';
import {Action} from '@ngrx/store';
import {BackendService} from '../backend.service';
import {
  ProjectActionTypes,
  RestartFuzzTarget,
  RestartScan,
  RunFuzzTarget,
  StartScan,
  StopFuzzing,
  StopScan,
  UpdateFuzzing,
  UpdateScan
} from './project.actions';
import {bufferTime, exhaustMap, filter} from 'rxjs/operators';
import 'rxjs/add/operator/map';
import {mergeFuzzingResults, mergeScanResults} from '../models/results';

@Injectable()
export class ProjectEffects {
  @Effect() startScan$: Observable<Action> = this.actions$.pipe(
    ofType(ProjectActionTypes.START_SCAN, ProjectActionTypes.RESTART_SCAN),
    exhaustMap((action: StartScan | RestartScan) =>
      this.backend
        .scanProject(action.project, action.scan.checkers)
        .pipe(bufferTime(5000), filter(scans => scans.length > 0))
        .map(scanResults => {
          const result = scanResults.reduce((acc, scan) => mergeScanResults(acc, scan));
          result.uuid = action.scan.uuid;
          return new UpdateScan(action.project, result);
        })
    ));

  @Effect() runFuzzTarget$: Observable<Action> = this.actions$.pipe(
    ofType(ProjectActionTypes.RUN_FUZZ_TARGET, ProjectActionTypes.RESTART_FUZZ_TARGET),
    exhaustMap((action: RunFuzzTarget | RestartFuzzTarget) =>
      this.backend
        .runFuzzTarget(action.project, action.target.name, action.target.code)
        .pipe(bufferTime(5000), filter(fuzzResults => fuzzResults.length > 0))
        .map(fuzzResults => {
          const result = fuzzResults.reduce((acc, fuzzResult) => mergeFuzzingResults(acc, fuzzResult));
          result.uuid = action.target.uuid;
          return new UpdateFuzzing(action.project, result);
        })
    ));


  @Effect() stopScan$: Observable<Action> = this.actions$.pipe(
    ofType(ProjectActionTypes.STOP_SCAN),
    exhaustMap((action: StopScan) =>
      this.backend
        .stopScan(action.project)
        .pipe(bufferTime(5000), filter(scans => scans.length > 0))
        .map(scanResults => {
          const result = scanResults.reduce((acc, scan) => mergeScanResults(acc, scan));
          result.uuid = action.scan.uuid;
          return new UpdateScan(action.project, result);
        })
    ));


  @Effect() stopFuzzing$: Observable<Action> = this.actions$.pipe(
    ofType(ProjectActionTypes.STOP_FUZZING),
    exhaustMap((action: StopFuzzing) =>
      this.backend
        .stopFuzzing(action.project, action.target.name, action.target.code)
        .pipe(bufferTime(5000), filter(fuzzResults => fuzzResults.length > 0))
        .map(fuzzResults => {
          const result = fuzzResults.reduce((acc, fuzzResult) => mergeFuzzingResults(acc, fuzzResult));
          result.uuid = action.target.uuid;
          return new UpdateFuzzing(action.project, result);
        })
    ));

  constructor(private actions$: Actions,
              private backend: BackendService) {
  }
}
