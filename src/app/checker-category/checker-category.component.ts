import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CheckerCategory} from '../models/checkers';
import {ConfigService} from '../config.service';

@Component({
  selector: 'app-checker-category',
  styleUrls: ['./checker-category.component.css'],
  template: `
    <section class="form-block" *ngIf="category">
    <label>{{category.info.name}}</label>
    <p>{{category.info.description}}</p>
    <div class="row">
      <div class="col-xs col-centered">
      </div>
    </div>
    <div class="row">
      <div class="col-xs col-centered">
        <div class="form-group">
          <div class="toggle-switch">
            <input type="checkbox"
                   id="enable_all_{{category.info.name}}"
                   [(ngModel)]="allEnabled"
                   name="{{category.info.name}}">
            <label for="enable_all_{{category.info.name}}"><b>Enable all</b></label>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs">
      </div>
    </div>
    <div class="row">
      <div class="col-xs offset-xs-1 col-centered">
        <span><b>Name</b></span>
      </div>
      <div class="col-xs offset-xs-6 col-centered">
        <span><b>Description</b></span>
      </div>
    </div>
    <app-checker *ngFor="let checker of category.checkers" [checker]="checker">
    </app-checker>
    <div class="row">
      <div class="col-xs">
      </div>
    </div>
  </section>
  `
})
export class CheckerCategoryComponent implements OnInit {
  @Input() category: CheckerCategory;

  constructor(private configService: ConfigService) {
  }

  ngOnInit() {
    this.configService.categoryEnabled$.subscribe(tag => {
      if (this.category.tag === tag) {
        this.category.allEnabled = true;
      }
    });
    this.configService.categoryDisabled$.subscribe(tag => {
      if (this.category.tag === tag) {
        this.category.allEnabled = false;
      }
    });
  }

  set allEnabled(enabled: boolean) {
    if (enabled) {
      this.category.checkers.forEach(checker => this.configService.enableChecker(checker.name));
      this.configService.enableCategory(this.category.tag);
    } else {
      this.category.checkers.forEach(checker => this.configService.disableChecker(checker.name));
      this.configService.disableCategory(this.category.tag);
    }
  }

  get allEnabled() {
    return this.category.allEnabled;
  }
}
