import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ClarityModule} from '@clr/angular';
import {AppComponent} from './app.component';
import {WorkbenchComponent} from './workbench/workbench.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {NgxElectronModule} from 'ngx-electron';
import {FormsModule} from '@angular/forms';
import {LogComponent} from './log/log.component';
import {FileTreeComponent} from './file-tree/file-tree.component';
import {CodeEditorComponent} from './code-editor/code-editor.component';
import {VulnerabilitiesListComponent} from './vulnerabilities-list/vulnerabilities-list.component';
import {VulnerabilityComponent} from './vulnerability/vulnerability.component';
import {VulnerabilitiesOverviewComponent} from './vulnerabilities-overview/vulnerabilities-overview.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {BackendService} from './backend.service';
import {CommonModule} from '@angular/common';
import {ScanComponent} from './scan/scan.component';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import {EffectsModule} from '@ngrx/effects';
import {ProjectEffects} from './state/project.effects';
import {reducers} from './state/reducers';
import {BasenamePipe} from './pipes/basename.pipe';
import {AlertComponent} from './alert/alert.component';
import {ProjectCardComponent} from './project-card/project-card.component';
import {FuzzingRunsComponent} from './fuzzing-runs/fuzzing-runs.component';
import {TailPipe} from './pipes/tail.pipe';
import {FileViewComponent} from './file-view/file-view.component';
import {AppEffects} from './state/app.effects';
import {ScanConfigurationComponent} from './scan-configuration/scan-configuration.component';
import {CheckerCategoryComponent} from './checker-category/checker-category.component';
import {CheckerComponent} from './checker/checker.component';
import {ConfigService} from './config.service';
import { VulnerabilitiesTableComponent } from './vulnerabilities-table/vulnerabilities-table.component';

const appRoutes: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'workbench/:project_name/:scan_id', component: WorkbenchComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    WorkbenchComponent,
    DashboardComponent,
    LogComponent,
    FileTreeComponent,
    CodeEditorComponent,
    FileTreeComponent,
    VulnerabilityComponent,
    VulnerabilitiesListComponent,
    VulnerabilitiesOverviewComponent,
    ScanComponent,
    BasenamePipe,
    TailPipe,
    AlertComponent,
    ProjectCardComponent,
    FuzzingRunsComponent,
    FileViewComponent,
    ScanConfigurationComponent,
    CheckerCategoryComponent,
    CheckerComponent,
    VulnerabilitiesTableComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxElectronModule,
    NgxChartsModule,
    ClarityModule,
    RouterModule.forRoot(appRoutes),
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([ProjectEffects, AppEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production
    })
  ],
  providers: [
    {provide: BackendService, useValue: new BackendService()},
    ConfigService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

declare var electron: any;
