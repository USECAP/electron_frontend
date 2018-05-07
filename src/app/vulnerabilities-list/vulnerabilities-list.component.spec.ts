import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {VulnerabilitiesListComponent} from './vulnerabilities-list.component';
import {ClarityModule} from '@clr/angular';
import {ElectronService} from 'ngx-electron';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {BackendService} from '../backend.service';
import {BasenamePipe} from '../pipes/basename.pipe';
import {ElectronTransport} from '../transport';

describe('VulnerabilitiesListComponent', () => {
  let component: VulnerabilitiesListComponent;
  let fixture: ComponentFixture<VulnerabilitiesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VulnerabilitiesListComponent, BasenamePipe],
      imports: [ClarityModule, NoopAnimationsModule],
      providers: [
        ElectronService,
        {provide: BackendService, useValue: new BackendService(new ElectronTransport('ws://localhost:4242'))}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VulnerabilitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
