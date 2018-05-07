import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckerCategoryComponent } from './checker-category.component';
import {ConfigService} from '../config.service';
import {CheckerComponent} from '../checker/checker.component';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

describe('CheckerCategoryComponent', () => {
  let component: CheckerCategoryComponent;
  let fixture: ComponentFixture<CheckerCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CheckerCategoryComponent,
        CheckerComponent
      ],
      imports: [
        FormsModule,
        BrowserModule
      ],
      providers: [ ConfigService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckerCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
