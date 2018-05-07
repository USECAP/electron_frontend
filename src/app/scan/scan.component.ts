import {Component, Input} from '@angular/core';
import {ResultsStatus, ScanResult} from '../models/results';
import {Project} from '../models/project';
import {Store} from '@ngrx/store';
import {DeleteScan, RestartScan, StartScan, StopScan} from '../state/project.actions';
import {AppState} from '../state/reducers';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.css']
})
export class ScanComponent {
  @Input() project: Project;
  public Status = ResultsStatus;

  constructor(private store: Store<AppState>) {
  }

  startScan(scan: ScanResult): void {
    this.store.dispatch(new StartScan(this.project, scan));
  }

  restartScan(scan: ScanResult): void {
    this.store.dispatch(new RestartScan(this.project, scan));
  }

  stopScan(scan: ScanResult): void {
    this.store.dispatch(new StopScan(this.project, scan));
  }

  removeScan(scan: ScanResult): void {
    this.store.dispatch(new DeleteScan(this.project, scan));
  }

  trackScan(index, item) {
    return item.uuid;
  }
}
