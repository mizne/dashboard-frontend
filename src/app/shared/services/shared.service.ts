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

  uploadFileFromTwitter(url: string): Observable<string> {
    return this.httpClient.post<ExecuteTaskResp>(`${environment.baseURL}/app/upload-file-from-twitter`, {
      url: url,
    }).pipe(
      map(resp => {
        if (resp.code === 0) {
          return resp.result as string
        } else {
          throw new Error(resp.message)
        }
      })
    )
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
    endTime: number,
    endTimeLimit: number[]
  ): Observable<ExecuteTaskResp> {
    return this.httpClient.post<ExecuteTaskResp>(
      `${this.baseURL}/app/execute-task-custom`,
      {
        task,
        interval,
        endTime,
        ...(endTimeLimit.length === 2 ? {
          minEndTime: endTimeLimit[0],
          maxEndTime: endTimeLimit[1],
        } : {})
      }
    );
  }

  relinkPM2(): Observable<ExecuteTaskResp> {
    return this.httpClient.post<ExecuteTaskResp>(`${environment.baseURL}/app/run-script`, {
      name: 'relink:pm2',
    });
  }

  fetchSocialLinks(website: string): Observable<SocialLink> {
    return this.httpClient.post(`${environment.baseURL}/app/social-links`, {
      url: website,
    });
  }

  fetchBlogTester(script: string, tag?: string): Observable<{
    result: Article[];
    logs: {
      debugs: string[];
      errors: string[];
    }
  }> {
    return this.httpClient.post<{
      result: Article[];
      logs: {
        debugs: string[];
        errors: string[];
      }
    }>(`${environment.baseURL}/app/blog-tester`, { script, tag });
  }

  fetchTimerTester(script: string, tag?: string): Observable<{
    result: {
      title: string;
      infos: string[];
      link: string;
    };
    logs: {
      debugs: string[];
      errors: string[];
    }
  }> {
    return this.httpClient.post<{
      result: {
        title: string;
        infos: string[];
        link: string;
      };
      logs: {
        debugs: string[];
        errors: string[];
      }
    }>(`${environment.baseURL}/app/timer-tester`, { script, tag });
  }

  fetchHookTester(script: string, hookValue: string, tag?: string): Observable<{
    result: {
      title: string;
      infos: string[];
      link: string;
    };
    logs: {
      debugs: string[];
      errors: string[];
    }
  }> {
    return this.httpClient.post<{
      result: {
        title: string;
        infos: string[];
        link: string;
      };
      logs: {
        debugs: string[];
        errors: string[];
      }
    }>(`${environment.baseURL}/app/hook-tester`, { script, tag, hookValue });
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
