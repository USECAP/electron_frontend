import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Checkers} from '../models/checkers';
import {BackendService} from '../backend.service';
import {ConfigService} from '../config.service';

@Component({
  selector: 'app-scan-configuration',
  templateUrl: './scan-configuration.component.html',
  styleUrls: ['./scan-configuration.component.css']
})
export class ScanConfigurationComponent implements OnInit {
  @Output() onConfigChange: EventEmitter<Checkers>;

  checkers: Checkers;
  projectOSs: { name: string, value: string }[];
  projectLanguages: { name: string, value: string }[];

  _projectOS: string;
  _projectLanguage: string;
  _alphaCheckers = false;

  constructor(private backendService: BackendService,
              private configService: ConfigService) {
    this.projectOSs = [
      {name: 'OS X', value: 'osx'},
      {name: 'Unix', value: 'unix'}
    ];
    this.projectLanguages = [
      {name: 'C++',         value: 'cplusplus'},
      {name: 'C',           value: 'c'},
      {name: 'Objective-C', value: 'objc'}
    ];
    this.onConfigChange = new EventEmitter<Checkers>();
  }

  ngOnInit() {
    this.backendService.getCheckers().subscribe(
      checkers => this.checkers = checkers,
      undefined,
      () => {
        this.enableCategory('security');
      });

    this.configService.categoryEnabled$.subscribe(tag => {
      this.enableCategory(tag);
    });

    this.configService.categoryDisabled$.subscribe(tag => {
      this.disableCategory(tag);
    });

    this.configService.checkerEnabled$.subscribe(checker => {
      this.enableChecker(checker);
    });

    this.configService.checkerDisabled$.subscribe(checker => {
      this.disableChecker(checker);
    });
  }

  set projectOS(value) {
    if (this._projectOS) {
      this.configService.disableCategory(this._projectOS);
      if (this._alphaCheckers) {
        this.configService.disableCategory('alpha.' + this._projectOS);
      }
    }
    this.configService.enableCategory(value);
    if (this._alphaCheckers) {
      this.configService.enableCategory('alpha.' + value);
    }
    this._projectOS = value;
  }

  get projectOS() {
    return this._projectOS;
  }

  set alphaCheckers(enable) {
    if (enable) {
      this.configService.enableCategory('alpha.core');
      this.configService.enableCategory('alpha.security');
      if (this._projectOS) {
        this.configService.enableCategory('alpha.' + this._projectOS);
      }
      if (this._projectLanguage && this._projectLanguage === 'cplusplus') {
        this.configService.enableCategory('alpha.cplusplus');
      }
    } else {
      this.configService.disableCategory('alpha.core');
      this.configService.disableCategory('alpha.security');
      if (this._projectOS) {
        this.configService.disableCategory('alpha.' + this._projectOS);
      }
      if (this._projectLanguage && this._projectLanguage === 'cplusplus') {
        this.configService.disableCategory('alpha.cplusplus');
      }
    }
    this._alphaCheckers = enable;
  }

  get alphaCheckers() {
    return this._alphaCheckers;
  }

  set projectLanguage(language: string) {
    if (this._projectLanguage && this._projectLanguage === 'cplusplus' && language !== 'cplusplus') {
      this.configService.disableCategory(this._projectLanguage);
      if (this._alphaCheckers) {
        this.configService.disableCategory('alpha.' + this._projectLanguage);
      }
    }
    if (language === 'cplusplus') {
      this.configService.enableCategory(language);
      if (this._alphaCheckers) {
        this.configService.disableCategory('alpha.' + language);
      }
    }

    this._projectLanguage = language;
  }

  get projectLanguage() {
    return this._projectLanguage;
  }

  enableCategory(tag: string) {
    this.checkers.enableCategory(tag, true);
    this.onConfigChange.emit(this.checkers);
  }

  disableCategory(tag: string) {
    this.checkers.enableCategory(tag, false);
    this.onConfigChange.emit(this.checkers);
  }

  enableChecker(checker: string) {
    this.checkers.enableChecker(checker, true);
    this.onConfigChange.emit(this.checkers);
  }

  disableChecker(checker: string) {
    this.checkers.enableChecker(checker, false);
    this.onConfigChange.emit(this.checkers);
  }

  resetCheckers() {
    // TODO: Restore default checkers
  }
}
