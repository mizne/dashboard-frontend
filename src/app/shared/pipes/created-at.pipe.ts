import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { map, Observable, of, startWith } from 'rxjs';
import { stringifyMills } from 'src/app/utils';
import { TimerService } from '../services';

@Pipe({
  name: 'createdAt',
})
export class CreatedAtPipe implements PipeTransform {
  constructor(private timerService: TimerService) { }
  transform(n: number | Date): Observable<string> {
    const ms = new Date(n).getTime();
    return this.timerService.interval(1).pipe(
      startWith(0),
      map(() => {
        const now = new Date().getTime();
        const delta = now - ms;
        const ONE_DAY = 1 * 24 * 60 * 60 * 1e3;
        const ONE_MONTH = 30 * 24 * 60 * 60 * 1e3;
        const ONE_YEAR = 365 * 24 * 60 * 60 * 1e3;
        const isSameYear =
          new Date(now).getFullYear() === new Date(ms).getFullYear();

        if (delta >= ONE_MONTH) {
          return isSameYear
            ? format(ms, 'MM-dd')
            : format(ms, 'yyyy-MM-dd');
        } else if (delta >= ONE_DAY) {
          return isSameYear
            ? format(ms, 'MM-dd HH:mm')
            : format(ms, 'yyyy-MM-dd HH:mm');
        }
        return stringifyMills(delta) + ' ago';
      })
    );
  }
}
