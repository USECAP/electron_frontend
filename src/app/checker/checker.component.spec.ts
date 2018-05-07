import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckerComponent } from './checker.component';
import {ConfigService} from '../config.service';
import {FormsModule} from '@angular/forms';
import {ClarityModule} from '@clr/angular';

describe('CheckerComponent', () => {
  let component: CheckerComponent;
  let fixture: ComponentFixture<CheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckerComponent ],
      imports: [
        FormsModule
      ],
      providers: [ ConfigService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
