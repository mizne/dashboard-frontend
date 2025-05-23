import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, of, tap, map, catchError, filter, take } from 'rxjs';
import { TimerService } from 'src/app/shared';
import { CexToken } from '../models/cex-token.model';
import { CexTokenService } from './cex-token.service';

@Injectable({ providedIn: 'root' })
export class CexTokenCacheService {
  constructor(
    private readonly cexTokenService: CexTokenService,
    private readonly notification: NzNotificationService,
    private readonly timerService: TimerService
  ) { }

  private allTokens: CexToken[] = [];
  private loading = false;

  queryBySymbol(symbol: string): Observable<CexToken | undefined> {
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

  queryByName(name: string): Observable<CexToken | undefined> {
    const theToken = this.allTokens.find((e) => e.name === name);
    if (theToken) {
      return of(theToken);
    }

    if (this.loading) {
      return this.timerService.interval(1).pipe(
        filter(() => this.loading === false),
        map(() => this.allTokens.find((e) => e.name === name)),
        take(1)
      );
    }

    return this.queryList().pipe(
      tap((tokens) => {
        this.allTokens = tokens;
        this.loading = false;
      }),
      map((tokens) => {
        return tokens.find((e) => e.name === name);
      })
    );
  }

  markRefreshCache() {
    this.queryList().subscribe((items) => {
      this.allTokens = items;
    })
  }

  private queryList(): Observable<CexToken[]> {
    this.loading = true;
    return this.cexTokenService.queryList().pipe(
      catchError((e: Error) => {
        this.notification.error(`获取CexToken失败`, `${e.message}`);
        return of([]);
      })
    );
  }
}
