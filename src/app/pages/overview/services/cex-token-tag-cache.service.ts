import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, of, tap, map, catchError, filter } from 'rxjs';
import { TimerService } from 'src/app/shared';
import { CexTokenTag } from '../models/cex-token-tag.model';
import { CexTokenTagService } from './cex-token-tag.service';

@Injectable()
export class CexTokenTagCacheService {
  constructor(
    private readonly cexTokenTagService: CexTokenTagService,
    private readonly notification: NzNotificationService,
    private readonly timerService: TimerService
  ) {}

  private allTokenTags: CexTokenTag[] = [];
  private loading = false;

  queryByName(name: string): Observable<CexTokenTag | undefined> {
    const theTokenTag = this.allTokenTags.find((e) => e.name === name);
    if (theTokenTag) {
      return of(theTokenTag);
    }

    if (this.loading) {
      return this.timerService.interval(1).pipe(
        filter(() => this.loading === false),
        map(() => this.allTokenTags.find((e) => e.name === name))
      );
    }

    return this.queryList().pipe(
      tap((tokenTags) => {
        this.loading = false;
        this.allTokenTags = tokenTags;
      }),
      map((tokenTags) => {
        return tokenTags.find((e) => e.name === name);
      })
    );
  }

  private queryList(): Observable<CexTokenTag[]> {
    this.loading = true;
    return this.cexTokenTagService.queryList().pipe(
      catchError((e: Error) => {
        this.notification.error(`获取token tag失败`, `${e.message}`);
        return of([]);
      })
    );
  }
}
