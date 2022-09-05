import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed',
})
export class ToFixedPipe implements PipeTransform {
  transform(n: number, count = 2): string {
    n = Number(n);
    if (n !== n) {
      return '--';
    }
    return Number(n).toFixed(count) + '';
  }
}
