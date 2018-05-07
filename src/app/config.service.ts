import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ConfigService {
  private checkerEnabledSource = new Subject<string>();
  private checkerDisabledSource = new Subject<string>();
  private categoryEnabledSource = new Subject<string>();
  private categoryDisabledSource = new Subject<string>();


  checkerEnabled$ = this.checkerEnabledSource.asObservable();
  checkerDisabled$ = this.checkerDisabledSource.asObservable();
  categoryEnabled$ = this.categoryEnabledSource.asObservable();
  categoryDisabled$ = this.categoryDisabledSource.asObservable();


  enableChecker(checker: string) {
    this.checkerEnabledSource.next(checker);
  }

  disableChecker(checker: string) {
    this.checkerDisabledSource.next(checker);
  }

  enableCategory(tag: string) {
    this.categoryEnabledSource.next(tag);
  }

  disableCategory(tag: string) {
    this.categoryDisabledSource.next(tag);
  }
}
