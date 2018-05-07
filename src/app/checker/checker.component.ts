import {Component, Input, OnInit} from '@angular/core';
import {Checker} from '../models/checkers';
import {ConfigService} from '../config.service';

@Component({
  selector: 'app-checker',
  styleUrls: ['./checker.component.css'],
  template: `
    <div class="row" *ngIf="checker">
      <div class="col-xs-1 col-right">
        <div class="toggle-switch">
          <input type="checkbox"
                 id="enable_{{checker.name}}"
                 [(ngModel)]="enabled"
                 name="{{checker.name}}">
          <label for="enable_{{checker.name}}"></label>
        </div>
      </div>
      <div class="col-xs col-left">
        <span><b>{{checker.name}}</b></span>
      </div>
      <div class="col-xs col-left">
        <span>{{checker.description}}</span>
      </div>
    </div>
  `
})
export class CheckerComponent implements OnInit {
  @Input() checker: Checker;

  constructor(private configService: ConfigService) {
  }

  ngOnInit() {
    this.configService.checkerEnabled$.subscribe(checker => {
      if (this.checker.name === checker) {
        this.checker.enabled = true;
      }
    });
    this.configService.checkerDisabled$.subscribe(checker => {
      if (this.checker.name === checker) {
        this.checker.enabled = false;
      }
    });
  }

  set enabled(enabled: boolean) {
    if (enabled) {
      this.configService.enableChecker(this.checker.name);
    } else {
      this.configService.disableChecker(this.checker.name);
    }
  }

  get enabled() {
    return this.checker.enabled;
  }
}
