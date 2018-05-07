import {Component, ViewChild, HostListener, AfterViewInit} from '@angular/core';
import {Project} from '../models/project';
import {groupIntoCategories, Vulnerability, VulnerabilityCategory} from '../models/vulnerability';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/combineLatest';
import {Result} from '../models/results';
import {AppState} from '../state/reducers';

export enum DetailViewKind {
  Overview,
  Vulnerability,
  File
}

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.css']
})
export class WorkbenchComponent implements AfterViewInit {
  public detailViewKinds = DetailViewKind;
  project$: Observable<Project>;
  result$: Observable<Result>;
  vulnerabilityCategories$: Observable<VulnerabilityCategory[]>;
  @ViewChild('borderline') borderline: any;
  @ViewChild('navigation') nav: any;
  shouldResize: Boolean = false;

  constructor(private route: ActivatedRoute,
              private store: Store<AppState>) {
    const observables = this.route.paramMap.combineLatest(
      this.store.pluck('projects'),
      (paramMap: ParamMap, projects: Project[]) => {
        const project_name = this.route.snapshot.paramMap.get('project_name');
        const scan_id = this.route.snapshot.paramMap.get('scan_id');
        const project = projects.filter(p => p.name === project_name)[0];
        // TODO fix this: a quick and dirty workaround to show fuzz results
        let result: Result = project.scans.filter(s => s.uuid === scan_id)[0];
        if (!result) {
          result = project.fuzzingResults.filter(f => f.uuid === scan_id)[0];
        }
        const categories = groupIntoCategories(result);
        return {project: project, result: result, categories: categories};
      }
    );
    this.project$ = observables.pluck('project');
    this.result$ = observables.pluck('result');
    this.vulnerabilityCategories$ = observables.pluck('categories');
  }

  get detailViewKind(): DetailViewKind {
    if (this._selectedFile) {
      return DetailViewKind.File;
    }
    if (this._selectedVulnerability) {
      return DetailViewKind.Vulnerability;
    }
    return DetailViewKind.Overview;
  }

  private _selectedVulnerability: Vulnerability;

  public get selectedVulnerability() {
    return this._selectedVulnerability;
  }

  public set selectedVulnerability(v: Vulnerability) {
    this._selectedVulnerability = v;
    if (v) {
      this._selectedFile = null;
    }
  }

  _selectedFile: string;

  public get selectedFile() {
    return this._selectedFile;
  }

  public set selectedFile(file: string) {
    this._selectedFile = file;
    if (file) {
      this._selectedVulnerability = null;
    }
  }

  public resetSelection() {
    this.selectedFile = null;
    this.selectedVulnerability = null;
  }

  @HostListener('window:mousemove', ['$event'])
  doResize(e: MouseEvent) {
    if (this.shouldResize) {
      document.body.classList.add('unselectable');
      const change = e.clientX - this.nav.offsetLeft;
      if (change < 216 || change > 624) {
        this.borderline.style.boxShadow = '3px 2px 5px #000';
      } else {
        this.nav.style.width = change + 'px';
        this.borderline.style.boxShadow = 'none';
      }
    }
  }

  @HostListener('window:mouseup', ['$event'])
  stopResize(ev: MouseEvent) {
    this.shouldResize = false;
    this.borderline.style.boxShadow = 'none';
    document.body.classList.remove('unselectable');
  }

  ngAfterViewInit() {
    this.borderline = this.borderline.nativeElement;
    this.nav = this.nav.nativeElement;
  }

}
