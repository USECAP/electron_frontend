import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {DashboardComponent} from './dashboard.component';
import {ClarityModule} from '@clr/angular';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {LogComponent} from '../log/log.component';
import {ElectronService} from 'ngx-electron';
import {APP_BASE_HREF} from '@angular/common';
import {RouterModule} from '@angular/router';
import {BackendService} from '../backend.service';
import {ScanComponent} from '../scan/scan.component';
import {StoreModule} from '@ngrx/store';
import {reducers} from '../state/reducers';
import {ElectronTransport} from '../transport';
import {AlertComponent} from '../alert/alert.component';
import {ProjectCardComponent} from '../project-card/project-card.component';
import {FuzzingRunsComponent} from '../fuzzing-runs/fuzzing-runs.component';
import {ScanConfigurationComponent} from '../scan-configuration/scan-configuration.component';
import {CheckerComponent} from '../checker/checker.component';
import {CheckerCategoryComponent} from '../checker-category/checker-category.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DashboardComponent,
        LogComponent,
        ScanComponent,
        ScanConfigurationComponent,
        CheckerCategoryComponent,
        CheckerComponent,
        ProjectCardComponent,
        FuzzingRunsComponent,
        AlertComponent,
      ],
      imports: [
        BrowserModule,
        FormsModule,
        ClarityModule,
        StoreModule.forRoot(reducers),
        RouterModule.forRoot([])
      ],
      providers: [
        ElectronService,
        {provide: APP_BASE_HREF, useValue: '/'},
        {provide: BackendService, useValue: new BackendService(new ElectronTransport('ws://localhost:4242'))}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
