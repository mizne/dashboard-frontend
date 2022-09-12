import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { filter, interval, Observable, share, Subject, startWith } from 'rxjs';
import { isNil } from 'src/app/utils';
import { format } from 'date-fns';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private readonly baseURL = environment.baseURL;
  private readonly interval$ = interval(1e3).pipe(
    // tap(() => {
    //   console.log(
    //     `interval before share ${format(new Date(), 'MM-dd HH:mm:ss')}`
    //   );
    // }),
    share()
  );
  constructor(private httpClient: HttpClient) {}

  checkConnections(): Observable<
    Array<{ hostname: string; status: 'success' | 'error'; message: string }>
  > {
    return this.httpClient.post(
      `${this.baseURL}/app/check-connections`,
      {}
    ) as Observable<
      Array<{ hostname: string; status: 'success' | 'error'; message: string }>
    >;
  }

  btcFutures(): Observable<{
    prices: number[];
    fundingRates: number[];
    longShortRatios: number[];
    openInterests: number[];
  }> {
    return this.httpClient.post(
      `${this.baseURL}/app/btc-futures`,
      {}
    ) as Observable<{
      prices: number[];
      fundingRates: number[];
      longShortRatios: number[];
      openInterests: number[];
    }>;
  }

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
    const invokeTime = new Date().getTime();
    return this.interval$.pipe(
      filter(() => {
        const now = new Date();
        const diffSeconds = Math.floor((now.getTime() - invokeTime) / 1e3);
        return diffSeconds > 0 && diffSeconds % seconds === 0;
      })
    );
  }

  // 返回document是否可见 如果browser tab被inactive则false
  documentVisible(): Observable<boolean> {
    const sub: Subject<boolean> = new Subject<boolean>();
    document.addEventListener('visibilitychange', (ev) => {
      sub.next(!document.hidden);
    });
    return sub.asObservable().pipe(startWith(!document.hidden));
  }
}
