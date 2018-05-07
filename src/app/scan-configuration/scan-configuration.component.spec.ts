import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanConfigurationComponent } from './scan-configuration.component';
import {BackendService} from '../backend.service';
import {ConfigService} from '../config.service';
import {ElectronTransport} from '../transport';
import {CheckerCategoryComponent} from '../checker-category/checker-category.component';
import {FormsModule} from '@angular/forms';
import {ClarityModule} from '@clr/angular';
import {BrowserModule} from '@angular/platform-browser';
import {CheckerComponent} from '../checker/checker.component';

describe('ScanConfigurationComponent', () => {
  let component: ScanConfigurationComponent;
  let fixture: ComponentFixture<ScanConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ScanConfigurationComponent,
        CheckerCategoryComponent,
        CheckerComponent
      ],
      imports: [
        FormsModule,
        ClarityModule
      ],
      providers: [
        {provide: BackendService, useValue: new BackendService(new ElectronTransport('ws://localhost:4242'))},
        ConfigService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
