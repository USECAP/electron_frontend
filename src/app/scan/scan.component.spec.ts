import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScanComponent} from './scan.component';
import {RouterModule} from '@angular/router';
import {BackendService} from '../backend.service';
import {APP_BASE_HREF} from '@angular/common';
import {ClarityModule} from '@clr/angular';
import {LogComponent} from '../log/log.component';
import {ElectronTransport} from '../transport';
import {StoreModule} from '@ngrx/store';
import {reducers} from '../state/reducers';

describe('ScanComponent', () => {
  let component: ScanComponent;
  let fixture: ComponentFixture<ScanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ScanComponent,
        LogComponent
      ],
      imports: [
        ClarityModule,
        StoreModule.forRoot(reducers),
        RouterModule.forRoot([])
      ],
      providers: [
        {provide: APP_BASE_HREF, useValue: '/'},
        {provide: BackendService, useValue: new BackendService(new ElectronTransport('ws://localhost:4242'))}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
