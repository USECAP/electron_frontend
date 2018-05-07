import {Component, EventEmitter, Input} from '@angular/core';
import {timer} from 'rxjs/observable/timer';
import 'rxjs/add/operator/take';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-alert',
  template: `
    <clr-alert [clrAlertType]="type" [clrAlertClosed]="alertClosed | async">
      <div class="alert-item">
        <span class="alert-text">
          {{_content}}
        </span>
        <div *ngIf="timeoutInSeconds" class="alert-actions">
          (hides in {{timeLeft | async}} seconds)
        </div>
      </div>
    </clr-alert>`
})
export class AlertComponent {
  @Input() type = 'alert-danger';
  @Input() timeoutInSeconds = 5;
  private alertClosed = new BehaviorSubject<boolean>(true);
  private timeLeft = new EventEmitter<number>();
  private _content: string;

  @Input() set content(content: string) {
    if (!content) {
      return;
    }
    this._content = content;
    this.alertClosed.next(false);
    timer(0, 1000).take(this.timeoutInSeconds + 1).subscribe(
      x => this.timeLeft.emit(this.timeoutInSeconds - x),
      undefined,
      () => {
        this.alertClosed.next(true);
      }
    );
  }

}
