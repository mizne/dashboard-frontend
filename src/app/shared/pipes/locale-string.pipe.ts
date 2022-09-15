import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localeString',
})
export class LocaleStringPipe implements PipeTransform {
  transform(n: number): string {
    n = Number(n);
    if (n !== n) {
      return '--';
    }
    if (Math.abs(n) <= 0.001) {
      return String(n);
    }
    return n.toLocaleString();
  }
}
