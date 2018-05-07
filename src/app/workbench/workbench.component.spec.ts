import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {WorkbenchComponent} from './workbench.component';
import {ClarityModule} from '@clr/angular';
import {VulnerabilitiesListComponent} from '../vulnerabilities-list/vulnerabilities-list.component';
import {VulnerabilityComponent} from '../vulnerability/vulnerability.component';
import {ElectronService} from 'ngx-electron';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {VulnerabilitiesOverviewComponent} from '../vulnerabilities-overview/vulnerabilities-overview.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {BackendService} from '../backend.service';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {CodeEditorComponent} from '../code-editor/code-editor.component';
import {BasenamePipe} from '../pipes/basename.pipe';
import {StoreModule} from '@ngrx/store';

describe('WorkbenchComponent', () => {
  let component: WorkbenchComponent;
  let fixture: ComponentFixture<WorkbenchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WorkbenchComponent,
        VulnerabilitiesListComponent,
        VulnerabilityComponent,
        VulnerabilitiesOverviewComponent,
        CodeEditorComponent,
        BasenamePipe
      ],
      imports: [
        ClarityModule,
        NoopAnimationsModule,
        NgxChartsModule,
        StoreModule.forRoot({})
      ],
      providers: [
        ElectronService,
        {
          provide: ActivatedRoute,
          useValue: {paramMap: Observable.of(convertToParamMap({project_name: 'test_project', scan_id: 1337}))}
        },
        {provide: BackendService, useValue: new BackendService()}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkbenchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
