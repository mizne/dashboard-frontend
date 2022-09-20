import { Pipe, PipeTransform } from '@angular/core';
import { stringifyNumber } from 'src/app/utils';

@Pipe({
  name: 'volume',
})
export class VolumePipe implements PipeTransform {
  transform(n: number): string {
    return stringifyNumber(n);
  }
}
