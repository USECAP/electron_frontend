import {Component, Input} from '@angular/core';
import {BackendService} from '../backend.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-file-view',
  template: `
    <div class="row" *ngIf="path">
      <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
        <div class="card">
          <div class="card-header">
            {{path}}
          </div>
          <div class="card-block">
            <div class="card-text">
              <app-code-editor
                style="height: 500px"
                [value]="content$ | async">
              </app-code-editor>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})

export class FileViewComponent {
  content$: Observable<string>;

  constructor(private backend: BackendService) {
  }

  private _path: string;

  get path() {
    return this._path;
  }

  @Input() set path(path) {
    this._path = path;
    if (!path) {
      return;
    }
    this.content$ = this.backend.readFile(path).map(s => s.toString());
  }
}
