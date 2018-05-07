'use strict';

import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {Wizard} from '@clr/angular';
import {ElectronService} from 'ngx-electron';
import {Project} from '../models/project';
import {select, Store} from '@ngrx/store';
import {AddProject} from '../state/project.actions';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {basename} from 'path';
import {AppState} from '../state/reducers';

const fs = new ElectronService().remote.require('fs');

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  @ViewChild('newProjectWizard') newProjectWizard: Wizard;
  @ViewChild('logs') logs: HTMLTextAreaElement;
  @ViewChild('pre') pre: HTMLPreElement;

  buildSystems: { name: string, value: string, necessaryFile: string }[];

  projects$: Observable<Project[]>;
  alertContent$ = new Subject<String>();

  projectName: string;
  projectPath: string;
  buildSystem = '';
  buildCommand: string;

  customBuildCommandRequired = false;
  buildCommandSelected = false;
  showNewProjectWizard = false;

  buildSystemTooltip: string;


  constructor(private electronService: ElectronService,
              private store: Store<AppState>) {
    this.projects$ = store.pipe(select('projects'));
    this.buildSystems = [
      {name: 'Custom build command', value: 'custom', necessaryFile: undefined},
      {name: 'Autotools', value: 'autotools', necessaryFile: 'configure.ac'},
      {name: 'CMake', value: 'cmake', necessaryFile: 'CMakeLists.txt'},
      {name: 'Make', value: 'make', necessaryFile: 'Makefile'}
    ];
  }

  ngOnInit() {
  }

  onNewProject() {
    this.showNewProjectWizard = true;
  }

  onBrowseProjectDirectory() {
    if (this.electronService.isElectronApp) {
      this.electronService.remote.dialog.showOpenDialog({
        title: 'Select project directory',
        buttonLabel: 'Open project directory',
        properties: ['openDirectory']
      }, (paths) => {
        if (paths && paths.length > 0) {
          this.projectPath = paths[0];
          this.projectName = basename(paths[0]);
          this.lookForBuildSystem(paths[0]);
        }
      });
    }
  }

  /**
   * Assigns the build system automatically if a typical file for exactly one
   * build system was found in the project directory. If none or multiple build
   * systems match, no build system is assigned automatically.
   * @param projectPath the project path
   */
  private lookForBuildSystem(projectPath) {
    fs.readdir(projectPath, (err, files) => {
      if (err) {
        return;
      }
      const matchingBuildSystems = this.buildSystems.filter(buildSystem => files.includes(buildSystem.necessaryFile));
      if (matchingBuildSystems && matchingBuildSystems.length === 1) {
        const match = matchingBuildSystems[0];
        this.buildSystem = match.value;
        this.buildSystemTooltip = `Selected automatically because "${match.necessaryFile}" was found in the project directory`;
      } else {
        this.buildSystem = '';
        this.buildSystemTooltip = '';
      }
    });
  }

  addProject() {
    if (this.hasValidProjectAttributes()) {
      const project = new Project({
        name: this.projectName,
        location: this.projectPath,
        buildSystem: this.buildSystem,
        buildCommand: this.customBuildCommandRequired ? this.buildCommand : undefined
      });
      this.store.dispatch(new AddProject(project));
      this.resetNewProjectWizard();
    }
    return false;
  }

  private hasValidProjectAttributes() {
    if (!this.projectName) {
      this.alertContent$.next('Could not create Project: Name is missing.');
    } else if (!this.projectPath) {
      this.alertContent$.next('Could not create Project: Path is missing.');
    } else if (!this.buildSystem) {
      this.alertContent$.next('Could not create Project: Build system is missing.');
    } else if (this.customBuildCommandRequired && !this.buildCommand) {
      this.alertContent$.next('Could not create Project: Build command is missing.');
    } else {
      return true;
    }
    return false;
  }

  private resetNewProjectWizard() {
    this.projectName = '';
    this.projectPath = '';
    this.buildCommand = '';
    this.buildSystem = '';
    this.buildCommandSelected = false;
    this.customBuildCommandRequired = false;
    this.showNewProjectWizard = false;
  }

  onCancel() {
    this.resetNewProjectWizard();
    this.newProjectWizard.close();
    this.newProjectWizard.reset();
  }

  buildSystemUpdated(value) {
    this.customBuildCommandRequired = value === 'custom';
    this.buildCommandSelected = this.buildCommandSelected || (value !== '');
  }

  // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
  trackProject(index, item) {
    return item.name;
  }
}
