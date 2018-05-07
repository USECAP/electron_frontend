import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';
import {Observable} from 'rxjs/Observable';
import {Action, Store} from '@ngrx/store';
import {BackendService} from '../backend.service';
import {filter, map, sample, tap, withLatestFrom} from 'rxjs/operators';
import {SetProjects} from './project.actions';
import {AppState} from './reducers';
import 'rxjs/add/operator/do';
import {defer} from 'rxjs/observable/defer';
import {interval} from 'rxjs/observable/interval';
import {ElectronService} from 'ngx-electron';
import * as path from 'path';

@Injectable()
export class AppEffects {
  static stateWasLoaded = false;

  /**
   * After every change: Store state to JSON.
   */
  @Effect({dispatch: false}) storeState$ = this.actions$.pipe(
    filter(() => AppEffects.stateWasLoaded),
    sample(interval(5000)),
    withLatestFrom(this.store),
    tap(([action, state]) => this.backend.storeState(state))
  );

  /**
   * Once after initialization: Load the state from JSON.
   */
  @Effect() loadState$: Observable<Action> = defer(() =>
    this.backend.loadState().pipe(
      map((state: AppState) => new SetProjects(state.projects ? state.projects : [])),
      tap(() => AppEffects.stateWasLoaded = true)
    )
  );

  constructor(private actions$: Actions,
              private store: Store<AppState>,
              private backend: BackendService,
              private electron: ElectronService) {
    if (electron.isElectronApp) {
      electron.remote.getCurrentWindow().on('close', () => {
        let state: AppState;
        store.take(1).subscribe(s => state = s);

        const userDataDir = electron.remote.app.getPath('userData');
        const fileName = path.join(userDataDir, 'projects.json');
        electron.remote.require('fs').writeFileSync(fileName, JSON.stringify(state));
      });
    }
  }
}
