import {Action} from '@ngrx/store';
import {Project} from '../models/project';
import {FuzzingResult, ScanResult} from '../models/results';

export enum ProjectActionTypes {
  ADD = '[Project] Add',
  DELETE = '[Project] Delete',
  ADD_SCAN = '[Project] Add new Scan',
  START_SCAN = '[Project] Start Scan',
  RESTART_SCAN = '[Project] Restart Scan',
  UPDATE_SCAN = '[Project] Update Scan',
  STOP_SCAN = '[Project] Stop Scan',
  DELETE_SCAN = '[Project] Delete Scan',
  SET_PROJECTS = '[Projects] Load From Store',
  STORE_PROJECTS = '[Projects] Store Projects',
  ADD_FUZZ_TARGET = '[Project] Add Fuzzing Target',
  RUN_FUZZ_TARGET = '[Project] Run Fuzzing Target',
  RESTART_FUZZ_TARGET = '[Project] Restart Fuzzing Target',
  DELETE_FUZZ_TARGET = '[Project] Delete Fuzzing Target',
  UPDATE_FUZZING = '[Project] Update Fuzzing',
  STOP_FUZZING = '[Project] Stop Fuzzing'
}

export class AddProject implements Action {
  readonly type = ProjectActionTypes.ADD;

  constructor(public project: Project) {
  }
}

export class DeleteProject implements Action {
  readonly type = ProjectActionTypes.DELETE;

  constructor(public project: Project) {
  }
}

export class AddScan implements Action {
  readonly type = ProjectActionTypes.ADD_SCAN;

  constructor(public project: Project, public scan: ScanResult) {
  }
}

export class StartScan implements Action {
  readonly type = ProjectActionTypes.START_SCAN;

  constructor(public project: Project, public scan: ScanResult) {
  }
}

export class RestartScan implements Action {
  readonly type = ProjectActionTypes.RESTART_SCAN;

  constructor(public project: Project, public scan: ScanResult) {
  }
}

export class UpdateScan implements Action {
  readonly type = ProjectActionTypes.UPDATE_SCAN;

  constructor(public project: Project, public update: ScanResult) {
  }
}

export class StopScan implements Action {
  readonly type = ProjectActionTypes.STOP_SCAN;

  constructor(public project: Project, public scan: ScanResult) {
  }
}

export class DeleteScan implements Action {
  readonly type = ProjectActionTypes.DELETE_SCAN;

  constructor(public project: Project, public scan: ScanResult) {
  }
}

export class AddFuzzTarget implements Action {
  readonly type = ProjectActionTypes.ADD_FUZZ_TARGET;

  constructor(public project: Project, public initFuzzTarget: FuzzingResult) {
  }
}

export class RunFuzzTarget implements Action {
  readonly type = ProjectActionTypes.RUN_FUZZ_TARGET;

  constructor(public project: Project, public target: FuzzingResult) {
  }
}

export class RestartFuzzTarget implements Action {
  readonly type = ProjectActionTypes.RESTART_FUZZ_TARGET;

  constructor(public project: Project, public target: FuzzingResult) {
  }
}

export class DeleteFuzzTarget implements Action {
  readonly type = ProjectActionTypes.DELETE_FUZZ_TARGET;

  constructor(public project: Project, public target: FuzzingResult) {
  }
}

export class UpdateFuzzing implements Action {
  readonly type = ProjectActionTypes.UPDATE_FUZZING;

  constructor(public project: Project, public update: FuzzingResult) {
  }
}

export class StopFuzzing implements Action {
  readonly type = ProjectActionTypes.STOP_FUZZING;

  constructor(public project: Project, public target: FuzzingResult) {
  }
}

export class SetProjects implements Action {
  readonly type = ProjectActionTypes.SET_PROJECTS;

  constructor(public projects: Project[]) {
  }
}

export class StoreProjects implements Action {
  readonly type = ProjectActionTypes.STORE_PROJECTS;
}

export type ProjectAction
  = AddProject
  | DeleteProject
  | AddScan
  | StartScan
  | RestartScan
  | UpdateScan
  | StopScan
  | DeleteScan
  | SetProjects
  | StoreProjects
  | AddFuzzTarget
  | RunFuzzTarget
  | RestartFuzzTarget
  | DeleteFuzzTarget
  | UpdateFuzzing
  | StopFuzzing;
