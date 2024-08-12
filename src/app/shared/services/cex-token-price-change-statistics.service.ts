import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexTokenPriceChangeStatistics } from '../models/cex-token-price-change-statistics.model';
import { FilterQuery } from 'src/app/shared';
import { KlineIntervalService } from './kline-interval.service';



@Injectable({ providedIn: 'root' })
export class CexTokenPriceChangeStatisticsService {
  private readonly baseURL = environment.baseURL;

  constructor(private httpClient: HttpClient, private readonly klineIntervalService: KlineIntervalService) { }

  queryList(
    query?: FilterQuery<CexTokenPriceChangeStatistics>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexTokenPriceChangeStatistics[]> {
    return this.httpClient.post<CexTokenPriceChangeStatistics[]>(
      `${this.baseURL}/cex-token-price-change-statistics/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexTokenPriceChangeStatistics>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-token-price-change-statistics/queryCount`,
      {
        query,
      }
    );
  }

  update(
    id: string | undefined,
    record: Partial<CexTokenPriceChangeStatistics>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/cex-token-price-change-statistics/update`,
      {
        id,
        record,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cex-token-price-change-statistics/${id}`);
  }


}
