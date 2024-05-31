import { Pipe, PipeTransform } from '@angular/core';
import { isNil, stringifyMills } from 'src/app/utils';

@Pipe({
  name: 'timeDuration',
})
export class TimeDurationPipe implements PipeTransform {
  transform(n: number): string {
    n = Number(n);
    return stringifyMills(n)
  }
}
