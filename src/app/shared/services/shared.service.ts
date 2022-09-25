import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, startWith, fromEvent, map } from 'rxjs';
import { KlineIntervals } from '../models';
import { DOCUMENT } from '@angular/common';

interface BTCDailyResp {
  prices: number[];
  volumes: number[];
  fundingRates: number[];
  longShortRatios: number[];
  openInterests: number[];
  dominances: number[];
  dominancesExcludeStableCoins: number[];
}

interface Connection {
  hostname: string;
  status: 'success' | 'error';
  message: string;
}

interface ExecuteTaskResp {
  code: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class SharedService {
  private readonly baseURL = environment.baseURL;
  constructor(
    private httpClient: HttpClient,
    @Inject(DOCUMENT) private documentRef: Document
  ) {}

  checkConnections(): Observable<Array<Connection>> {
    return this.httpClient.post<Array<Connection>>(
      `${this.baseURL}/app/check-connections`,
      {}
    );
  }

  btcDailies(interval: KlineIntervals, limit = 180): Observable<BTCDailyResp> {
    return this.httpClient.post<BTCDailyResp>(
      `${this.baseURL}/app/btc-dailies`,
      {
        interval,
        limit,
      }
    );
  }

  executeTaskCustom(
    task: string,
    interval: KlineIntervals,
    endTime: number
  ): Observable<ExecuteTaskResp> {
    return this.httpClient.post<ExecuteTaskResp>(
      `${this.baseURL}/app/execute-task-custom`,
      {
        task,
        interval,
        endTime,
      }
    );
  }

  // 返回document是否可见 如果browser tab被inactive则false
  documentVisible(): Observable<boolean> {
    return fromEvent(this.documentRef, 'visibilitychange').pipe(
      map(() => !this.documentRef.hidden),
      startWith(!this.documentRef.hidden)
    );
  }
}
