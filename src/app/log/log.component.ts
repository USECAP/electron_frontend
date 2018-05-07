import {Component, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-log',
  template: `
    <pre>{{content}}</pre>`,
})
export class LogComponent implements OnChanges {

  @Input() content: string;

  constructor(private element: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const child = this.element.nativeElement.firstElementChild;
    setTimeout(() => {
      if (child) {
        child.scrollTop = child.scrollHeight;
      }
    }, 100);
  }

}
