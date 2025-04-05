import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexTokenVolumeRankingStatistics } from '../models/cex-token-volume-ranking-statistics.model';
import { FilterQuery } from 'src/app/shared';
import { KlineIntervalService } from './kline-interval.service';



@Injectable({ providedIn: 'root' })
export class CexTokenVolumeRankingStatisticsService {
  private readonly baseURL = environment.baseURL;

  constructor(private httpClient: HttpClient, private readonly klineIntervalService: KlineIntervalService) { }

  queryList(
    query?: FilterQuery<CexTokenVolumeRankingStatistics>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexTokenVolumeRankingStatistics[]> {
    return this.httpClient.post<CexTokenVolumeRankingStatistics[]>(
      `${this.baseURL}/cex-token-volume-ranking-statistics/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexTokenVolumeRankingStatistics>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-token-volume-ranking-statistics/queryCount`,
      {
        query,
      }
    );
  }

  update(
    id: string | undefined,
    record: Partial<CexTokenVolumeRankingStatistics>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/cex-token-volume-ranking-statistics/update`,
      {
        id,
        record,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cex-token-volume-ranking-statistics/${id}`);
  }
}
