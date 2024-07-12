import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'src/app/utils';

@Pipe({
  name: 'percent',
})
export class PercentPipe implements PipeTransform {
  transform(n: number, fixedCount?: number): string {
    n = Number(n);
    if (n !== n) {
      return '--';
    }
    if (isNil(fixedCount)) {
      if (Math.abs(n) <= 1e-6) {
        fixedCount = 6;
      } else if (Math.abs(n) <= 1e-4) {
        fixedCount = 4;
      } else {
        fixedCount = 2;
      }
    }

    return Number(n * 100).toFixed(fixedCount) + '%';
  }
}
