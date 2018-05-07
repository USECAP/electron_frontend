import {Project} from '../models/project';
import {
  AddFuzzTarget,
  AddProject,
  AddScan,
  DeleteFuzzTarget,
  DeleteProject,
  DeleteScan,
  ProjectAction,
  ProjectActionTypes,
  RestartFuzzTarget,
  RestartScan,
  RunFuzzTarget,
  SetProjects,
  StartScan,
  StopFuzzing,
  StopScan,
  UpdateFuzzing,
  UpdateScan
} from './project.actions';
import {mergeFuzzingResults, mergeScanResults, ResultsStatus} from '../models/results';

export type Projects = Project[];

const initialState: Projects = [];

export function projectReducer(state: Projects = initialState, action: ProjectAction): Projects {
  switch (action.type) {
    case ProjectActionTypes.ADD: {
      const act = action as AddProject;
      if (state.find(project => act.project.name === project.name)) {
        return state;
      }
      return state.concat(act.project);
    }

    case ProjectActionTypes.DELETE: {
      const act = action as DeleteProject;
      return state.filter(project => act.project.name !== project.name);
    }

    case ProjectActionTypes.ADD_SCAN: {
      const scanAction = action as AddScan;
      return state.map(project => {
        if (project.name === scanAction.project.name) {
          return {
            ...project,
            scans: project.scans.concat(scanAction.scan)
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.START_SCAN: {
      const act = action as StartScan;
      return state.map(project => {
        if (project.name === act.project.name) {
          return {
            ...project,
            scans: project.scans.map(scan => {
              if (scan.uuid === act.scan.uuid) {
                return {...scan, status: ResultsStatus.RUNNING};
              }
              return scan;
            })
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.RESTART_SCAN: {
      const act = action as RestartScan;
      return state.map(project => {
        if (project.name === act.project.name) {
          return {
            ...project,
            scans: project.scans.map(scan => {
              if (scan.uuid === act.scan.uuid) {
                return {...scan, logs: '', vulnerabilities: [], status: ResultsStatus.BUILDING};
              }
              return scan;
            })
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.UPDATE_SCAN: {
      const scanAction = action as UpdateScan;
      return state.map(project => {
        if (project.name === scanAction.project.name) {
          return {
            ...project,
            scans: project.scans.map(scan => {
              if (scan.uuid === scanAction.update.uuid) {
                return mergeScanResults(scan, scanAction.update);
              }
              return scan;
            })
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.STOP_SCAN: {
      return state;
    }

    case ProjectActionTypes.DELETE_SCAN: {
      const scanAction = action as DeleteScan;
      return state.map(project => {
        if (project.name === scanAction.project.name) {
          return {
            ...project,
            scans: project.scans.filter(scan => scan.uuid !== scanAction.scan.uuid)
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.SET_PROJECTS: {
      const act = action as SetProjects;
      return act.projects;
    }

    case ProjectActionTypes.ADD_FUZZ_TARGET: {
      const act = action as AddFuzzTarget;
      return state.map(project => {
        if (project.name === act.project.name) {
          return {
            ...project,
            fuzzingResults: project.fuzzingResults.concat(act.initFuzzTarget)
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.DELETE_FUZZ_TARGET: {
      const act = action as DeleteFuzzTarget;
      return state.map(project => {
        if (project.name === act.project.name) {
          return {
            ...project,
            fuzzingResults: project.fuzzingResults.filter(fuzz => fuzz.uuid !== act.target.uuid)
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.RUN_FUZZ_TARGET: {
      const act = action as RunFuzzTarget;
      return state.map(project => {
        if (project.name === act.project.name) {
          return {
            ...project,
            fuzzingResults: project.fuzzingResults.map(fuzzResult => {
              if (fuzzResult.uuid === act.target.uuid) {
                return {
                  ...fuzzResult,
                  status: ResultsStatus.RUNNING
                };
              }
              return fuzzResult;
            })
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.RESTART_FUZZ_TARGET: {
      const act = action as RestartFuzzTarget;
      return state.map(project => {
        if (project.name === act.project.name) {
          return {
            ...project,
            fuzzingResults: project.fuzzingResults.map(fuzz => {
              if (fuzz.uuid === act.target.uuid) {
                return {...fuzz, logs: '', vulnerabilities: [], status: ResultsStatus.BUILDING};
              }
              return fuzz;
            })
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.UPDATE_FUZZING: {
      const act = action as UpdateFuzzing;
      return state.map(project => {
        if (project.name === act.project.name) {
          return {
            ...project,
            fuzzingResults: project.fuzzingResults.map(fuzzResult => {
              if (fuzzResult.uuid === act.update.uuid) {
                return mergeFuzzingResults(fuzzResult, act.update);
              }
              return fuzzResult;
            })
          };
        }
        return project;
      });
    }

    case ProjectActionTypes.STOP_FUZZING: {
      return state;
    }
  }
}
