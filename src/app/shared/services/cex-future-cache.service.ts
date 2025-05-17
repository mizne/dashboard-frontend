import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, of, tap, map, catchError, filter, take } from 'rxjs';
import { CexFuture, TimerService } from 'src/app/shared';
import { CexToken } from '../models/cex-token.model';
import { CexFutureService } from './cex-future.service';

@Injectable({ providedIn: 'root' })
export class CexFutureCacheService {
  constructor(
    private readonly cexFutureService: CexFutureService,
    private readonly notification: NzNotificationService,
    private readonly timerService: TimerService
  ) { }

  private allTokens: CexFuture[] = [];
  private loading = false;

  queryBySymbol(symbol: string): Observable<CexFuture | undefined> {
    const theToken = this.allTokens.find((e) => e.symbol === symbol);
    if (theToken) {
      return of(theToken);
    }

    if (this.loading) {
      return this.timerService.interval(1).pipe(
        filter(() => this.loading === false),
        map(() => this.allTokens.find((e) => e.symbol === symbol)),
        take(1)
      );
    }

    return this.queryList().pipe(
      tap((tokens) => {
        this.allTokens = tokens;
        this.loading = false;
      }),
      map((tokens) => {
        return tokens.find((e) => e.symbol === symbol);
      })
    );
  }



  markRefreshCache() {
    this.queryList().subscribe((items) => {
      this.allTokens = items;
    })
  }

  private queryList(): Observable<CexFuture[]> {
    this.loading = true;
    return this.cexFutureService.queryList().pipe(
      catchError((e: Error) => {
        this.notification.error(`获取CexFuture失败`, `${e.message}`);
        return of([]);
      })
    );
  }
}
