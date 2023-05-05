import { Injectable } from '@angular/core';
import { filter, interval, Observable, share, map } from 'rxjs';
import { isNil } from 'src/app/utils';

@Injectable({ providedIn: 'root' })
export class TimerService {
  constructor() { }

  private readonly interval$ = interval(1e3).pipe(
    // tap(() => {
    //   console.log(
    //     `interval before share ${format(new Date(), 'MM-dd HH:mm:ss')}`
    //   );
    // }),
    share()
  );

  schedule(rule: {
    hour?: number | number[];
    minute?: number | number[];
    second?: number | number[];
  }): Observable<number> {
    const check = (
      theNumber: number,
      ruleNumber?: number | number[]
    ): boolean => {
      if (isNil(ruleNumber)) {
        return true;
      }
      if (typeof ruleNumber === 'number') {
        return theNumber === ruleNumber;
      }

      if (
        Array.isArray(ruleNumber) &&
        ruleNumber.every((e) => typeof e === 'number')
      ) {
        return ruleNumber.includes(theNumber);
      }

      return false;
    };
    return this.interval$.pipe(
      filter(() => {
        const now = new Date();
        const theHour = now.getHours();
        const theMinute = now.getMinutes();
        const theSecond = now.getSeconds();

        return (
          check(theHour, rule.hour) &&
          check(theMinute, rule.minute) &&
          check(theSecond, rule.second)
        );
      })
    );
  }

  interval(seconds: number): Observable<number> {
    let index = -1;
    return this.interval$.pipe(
      filter((n: number) => {
        return (n + 1) % seconds === 0;
      }),
      map(() => {
        index += 1;
        return index;
      })
    );
  }
}
