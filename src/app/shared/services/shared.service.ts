import { Inject, Injectable, ViewContainerRef } from '@angular/core';
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
  result?: any
}

interface SocialLink {
  twitter?: string;
  telegram?: string;
  discord?: string;
  medium?: string;
  youtube?: string;
}

interface BlogResolverParams {
  url: string;
  method: string;
  headers: any;
  script: string;
}

export interface Article {
  title: string;
  publishedAt: number;
  url: string;
  source: string;
}


@Injectable({ providedIn: 'root' })
export class SharedService {
  private readonly baseURL = environment.baseURL;

  private viewContainerRef: ViewContainerRef | null = null;
  constructor(
    private httpClient: HttpClient,
    @Inject(DOCUMENT) private documentRef: Document
  ) { }

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append("file", file);
    return this.httpClient.post<ExecuteTaskResp>(
      `${this.baseURL}/app/upload-file`,
      formData
    ).pipe(
      map(resp => {
        if (resp.code === 0) {
          return resp.result as string
        } else {
          throw new Error(resp.message)
        }
      })
    );
  }

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

  fetchSocialLinks(website: string): Observable<SocialLink> {
    return this.httpClient.post(`${environment.baseURL}/app/social-links`, {
      url: website,
    });
  }

  fetchBlogTester(params: BlogResolverParams): Observable<{
    results: Article[];
    logs: {
      debugs: string[];
      errors: string[];
    }
  }> {
    return this.httpClient.post<{
      results: Article[];
      logs: {
        debugs: string[];
        errors: string[];
      }
    }>(`${environment.baseURL}/app/blog-tester`, params);
  }

  fetchLink3ActivityDetail(url?: string): Observable<{
    code: number;
    message: string;
    result?: {
      title: string;
      url: string;
      startTime: number;
      endTime: number;

      rewardInfo?: string;
      organizerHandle: string;
      source?: string;
    }
  }> {
    return this.httpClient.post(`${environment.baseURL}/app/link3-activity-detail`, {
      url: url,
    }) as Observable<{
      code: number;
      message: string;
      result?: {
        title: string;
        url: string;
        startTime: number;
        endTime: number;

        rewardInfo?: string;
        organizerHandle: string;
        source?: string;
      }
    }>
  }

  // 返回document是否可见 如果browser tab被inactive则false
  documentVisible(): Observable<boolean> {
    return fromEvent(this.documentRef, 'visibilitychange').pipe(
      map(() => !this.documentRef.hidden),
      startWith(!this.documentRef.hidden)
    );
  }

  setAppViewContainerRef(v: ViewContainerRef) {
    this.viewContainerRef = v;
  }

  getAppViewContainerRef(): ViewContainerRef {
    return this.viewContainerRef as ViewContainerRef
  }
}
