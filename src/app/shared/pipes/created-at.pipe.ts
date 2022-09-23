import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { map, Observable, of, startWith } from 'rxjs';
import { stringifyMills } from 'src/app/utils';
import { TimerService } from '../services';

@Pipe({
  name: 'createdAt',
})
export class CreatedAtPipe implements PipeTransform {
  constructor(private timerService: TimerService) {}
  transform(n: number | Date): Observable<string> {
    const ms = new Date(n).getTime();
    return this.timerService.interval(1).pipe(
      startWith(0),
      map(() => {
        const now = new Date().getTime();
        const delta = now - ms;
        const limit = 1 * 24 * 60 * 60 * 1e3;

        if (delta >= limit) {
          const isSameYear =
            new Date(now).getFullYear() === new Date(ms).getFullYear();
          return isSameYear
            ? format(ms, 'MM-dd HH:mm:ss')
            : format(ms, 'yyyy-MM-dd HH:mm:ss');
        }
        return stringifyMills(delta) + ' ago';
      })
    );
  }
}
