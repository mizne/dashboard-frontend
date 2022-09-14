import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, of, tap, map, catchError, interval, filter } from 'rxjs';
import { CexToken } from '../models/cex-token.model';
import { CexTokenService } from './cex-token.service';

@Injectable()
export class CexTokenCacheService {
  constructor(
    private readonly cexTokenService: CexTokenService,
    private readonly notification: NzNotificationService
  ) {}

  private allTokens: CexToken[] = [];
  private loading = false;

  queryBySymbol(symbol: string): Observable<CexToken | undefined> {
    const theToken = this.allTokens.find((e) => e.symbol === symbol);
    if (theToken) {
      return of(theToken);
    }

    if (this.loading) {
      return interval(1e3).pipe(
        filter(() => this.loading === false),
        map(() => this.allTokens.find((e) => e.symbol === symbol))
      );
    }

    return this.queryList().pipe(
      tap((tokens) => {
        this.loading = false;
        this.allTokens = tokens;
      }),
      map((tokens) => {
        return tokens.find((e) => e.symbol === symbol);
      })
    );
  }

  private queryList(): Observable<CexToken[]> {
    this.loading = true;
    return this.cexTokenService.queryList().pipe(
      catchError((e: Error) => {
        this.notification.error(`获取token失败`, `${e.message}`);
        return of([]);
      })
    );
  }
}
