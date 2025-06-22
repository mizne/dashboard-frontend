import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexFuturePriceChange, CustomDateRangeCexFuturePriceChange } from '../models/cex-future-price-change.model';
import { FilterQuery } from 'src/app/shared';
import { KlineIntervalService } from './kline-interval.service';



@Injectable({ providedIn: 'root' })
export class CexFuturePriceChangeService {
  private readonly baseURL = environment.baseURL;

  constructor(private httpClient: HttpClient, private readonly klineIntervalService: KlineIntervalService) { }

  queryList(
    query?: FilterQuery<CexFuturePriceChange>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexFuturePriceChange[]> {
    query = query || {}
    if (!query.time) {
      Object.assign(query, { time: this.klineIntervalService.resolveOneDayIntervalMills(1) })
    }

    return this.httpClient.post<CexFuturePriceChange[]>(
      `${this.baseURL}/cex-future-price-change/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexFuturePriceChange>): Observable<number> {
    query = query || {}
    if (!query.time) {
      Object.assign(query, { time: this.klineIntervalService.resolveOneDayIntervalMills(1) })
    }
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-future-price-change/queryCount`,
      {
        query,
      }
    );
  }

  update(
    id: string | undefined,
    record: Partial<CexFuturePriceChange>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/cex-future-price-change/update`,
      {
        id,
        record,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cex-future-price-change/${id}`);
  }

  queryListCustomDateRange(
    dateRangeStart: number,
    dateRangeEnd: number
  ): Observable<CustomDateRangeCexFuturePriceChange[]> {
    return this.httpClient.post<CustomDateRangeCexFuturePriceChange[]>(
      `${this.baseURL}/cex-future-price-change/queryListCustomDateRange`,
      {
        dateRangeStart,
        dateRangeEnd,
      }
    );
  }





}
