import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percent',
})
export class PercentPipe implements PipeTransform {
  transform(n: number, fixedCount = 2): string {
    n = Number(n);
    if (n !== n) {
      return '--';
    }
    return Number(n * 100).toFixed(fixedCount) + '%';
  }
}
