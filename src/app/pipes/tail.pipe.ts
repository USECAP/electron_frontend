import {Pipe, PipeTransform} from '@angular/core';

/**
 * Returns the last x number of lines.
 *
 * Usage:
 *   value | tail: <lines>
 */
@Pipe({name: 'tail'})
export class TailPipe implements PipeTransform {
  transform(value: string, lines: number): string {
    let i: number;
    for (i = value.length - 1; i > 0; i--) {
      if (value[i] === '\n') {
        --lines;
        if (lines <= 0) {
          i++;
          break;
        }
      }
    }
    return value.slice(i);
  }
}
