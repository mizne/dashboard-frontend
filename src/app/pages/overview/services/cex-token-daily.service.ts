import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CexTokenDaily } from '../models/cex-token-daily.model';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterQuery } from 'src/app/shared';

@Injectable()
export class CexTokenDailyService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) {}

  queryList(
    query?: FilterQuery<CexTokenDaily>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexTokenDaily[]> {
    return this.httpClient
      .post(`${this.baseURL}/cex-token-daily/queryList`, {
        query,
        page,
        sort,
      })
      .pipe(
        map((results) => {
          const res = results as CexTokenDaily[];

          return res.map((e) => ({
            ...e,
            emaCompressionRelative: 1 - e.emaCompressionRelative,
          }));
        })
      ) as Observable<CexTokenDaily[]>;
  }

  queryCount(query?: FilterQuery<CexTokenDaily>): Observable<number> {
    return this.httpClient.post(`${this.baseURL}/cex-token-daily/queryCount`, {
      query,
    }) as Observable<number>;
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete(
      `${this.baseURL}/cex-token-daily/${id}`
    ) as Observable<number>;
  }
}
