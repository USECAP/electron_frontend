import {async, TestBed} from '@angular/core/testing';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {VulnerabilitiesOverviewComponent} from './vulnerabilities-overview.component';
import {ElectronService} from 'ngx-electron';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {BackendService} from '../backend.service';
import {ChangeDetectorRef} from '@angular/core';

describe('VulnerabilitiesOverviewComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VulnerabilitiesOverviewComponent],
      imports: [NgxChartsModule, NoopAnimationsModule],
      providers: [
        ElectronService,
        ChangeDetectorRef,
        {provide: BackendService, useValue: new BackendService()}
      ]
    })
      .compileComponents();
  }));
});
