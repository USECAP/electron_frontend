import {projectReducer, Projects} from './project.reducer';
import {ActionReducerMap} from '@ngrx/store';

export interface AppState {
  projects: Projects;
}

export const reducers: ActionReducerMap<AppState> = {projects: projectReducer};
