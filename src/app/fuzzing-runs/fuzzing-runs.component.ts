import {Component, Input, OnInit} from '@angular/core';
import {Project} from '../models/project';
import {FuzzingResult, ResultsStatus} from '../models/results';
import {Store} from '@ngrx/store';
import {AppState} from '../state/reducers';
import {DeleteFuzzTarget, RestartFuzzTarget, RunFuzzTarget, StopFuzzing} from '../state/project.actions';

@Component({
  selector: 'app-fuzzing-runs',
  templateUrl: './fuzzing-runs.component.html',
  styleUrls: ['./fuzzing-runs.component.css']
})
export class FuzzingRunsComponent implements OnInit {
  @Input() project: Project;
  public Status = ResultsStatus;

  constructor(public store: Store<AppState>) {
  }

  ngOnInit() {
  }

  runFuzzingTarget(fuzz: FuzzingResult): void {
    this.store.dispatch(new RunFuzzTarget(this.project, fuzz));
  }

  rerunFuzzingTarget(fuzz: FuzzingResult): void {
    this.store.dispatch(new RestartFuzzTarget(this.project, fuzz));
  }

  stopFuzzing(fuzz: FuzzingResult): void {
    this.store.dispatch(new StopFuzzing(this.project, fuzz));
  }

  deleteFuzzingTarget(fuzz: FuzzingResult): void {
    this.store.dispatch(new DeleteFuzzTarget(this.project, fuzz));
  }
}

