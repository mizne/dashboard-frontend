import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexTokenPriceChange, CustomDateRangeCexTokenPriceChange, MarketRequest, MarketShift } from '../models/cex-token-price-change.model';
import { FilterQuery } from 'src/app/shared';
import { KlineIntervalService } from './kline-interval.service';



@Injectable({ providedIn: 'root' })
export class CexTokenPriceChangeService {
  private readonly baseURL = environment.baseURL;

  constructor(private httpClient: HttpClient, private readonly klineIntervalService: KlineIntervalService) { }

  queryList(
    query?: FilterQuery<CexTokenPriceChange>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexTokenPriceChange[]> {
    query = query || {}
    if (!query.time) {
      Object.assign(query, { time: this.klineIntervalService.resolveOneDayIntervalMills(1) })
    }

    return this.httpClient.post<CexTokenPriceChange[]>(
      `${this.baseURL}/cex-token-price-change/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexTokenPriceChange>): Observable<number> {
    query = query || {}
    if (!query.time) {
      Object.assign(query, { time: this.klineIntervalService.resolveOneDayIntervalMills(1) })
    }
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-token-price-change/queryCount`,
      {
        query,
      }
    );
  }

  update(
    id: string | undefined,
    record: Partial<CexTokenPriceChange>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/cex-token-price-change/update`,
      {
        id,
        record,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cex-token-price-change/${id}`);
  }

  queryListCustomDateRange(
    dateRangeStart: number,
    dateRangeEnd: number
  ): Observable<CustomDateRangeCexTokenPriceChange[]> {
    return this.httpClient.post<CustomDateRangeCexTokenPriceChange[]>(
      `${this.baseURL}/cex-token-price-change/queryListCustomDateRange`,
      {
        dateRangeStart,
        dateRangeEnd,
      }
    );
  }

  queryMarketShift(
    dateRangeStart: number,
    dateRangeEnd: number,
    inDays: number,
    currentPriceRelativeThreshold: number,
    percentThreshold: number,
    request: MarketRequest
  ): Observable<{
    code: number;
    message: string;
    result: Array<MarketShift>
  }> {
    return this.httpClient.post<{
      code: number;
      message: string;
      result: Array<MarketShift>
    }>(
      `${this.baseURL}/cex-token-price-change/queryMarketShift`,
      {
        dateRangeStart,
        dateRangeEnd,
        inDays,
        currentPriceRelativeThreshold,
        percentThreshold,
        request
      }
    );
  }


  queryMarketShiftByMultipleInDays(
    dateRangeStart: number,
    dateRangeEnd: number,
    request: MarketRequest,
    filters: Array<{
      inDays: number;
      currentPriceRelativeThreshold: number;
      percentThreshold: number;
    }>
  ): Observable<{
    code: number;
    message: string;
    result: Array<MarketShift>
  }> {
    return this.httpClient.post<{
      code: number;
      message: string;
      result: Array<MarketShift>
    }>(
      `${this.baseURL}/cex-token-price-change/queryMarketShiftByMultipleInDays`,
      {
        dateRangeStart,
        dateRangeEnd,
        request,
        filters
      }
    );
  }
}
