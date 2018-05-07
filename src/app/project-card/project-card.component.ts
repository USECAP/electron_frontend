import {Component, Input, OnInit} from '@angular/core';
import {Project} from '../models/project';
import {Checkers} from '../models/checkers';
import {AddFuzzTarget, AddScan, DeleteProject} from '../state/project.actions';
import {FuzzingResult, ScanResult} from '../models/results';
import {Store} from '@ngrx/store';
import {AppState} from '../state/reducers';


@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css']
})


export class ProjectCardComponent implements OnInit {
  @Input() project: Project;

  showNewFuzzModal = false;
  showNewScanModal = false;
  fuzzTargetCode: string;
  fuzzTargetName: string;
  checkers: Checkers;

  constructor(private store: Store<AppState>) {
    this.resetFuzzTarget();
  }

  ngOnInit() {
  }

  removeProject() {
    this.store.dispatch(new DeleteProject(this.project));
  }

  openScanModal() {
    this.showNewScanModal = true;
  }

  updateCheckers(checkers: Checkers) {
    this.checkers = checkers;
  }

  addScan() {
    this.store.dispatch(new AddScan(this.project, new ScanResult(this.checkers.getCmdLineArguments())));
    this.showNewScanModal = false;
  }

  openFuzzingModal() {
    this.showNewFuzzModal = true;
  }

  AddFuzzingTarget() {
    const initialFuzzTarget = new FuzzingResult(this.fuzzTargetName, this.fuzzTargetCode);
    this.store.dispatch(new AddFuzzTarget(this.project, initialFuzzTarget));
    this.resetFuzzTarget();
    this.showNewFuzzModal = false;
  }

  private resetFuzzTarget() {
    this.fuzzTargetCode = `
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
  DoSomethingInterestingWithMyAPI(Data, Size);
  return 0;
}
  `;
    this.fuzzTargetName = 'target';
  }
}
