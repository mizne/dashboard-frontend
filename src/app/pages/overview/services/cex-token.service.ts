import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CexTokenDaily } from '../models/cex-token-daily.model';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexToken } from '../models/cex-token.model';
import { FilterQuery } from 'src/app/shared';

@Injectable()
export class CexTokenService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) {}

  queryList(
    query?: FilterQuery<CexToken>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexToken[]> {
    return this.httpClient.post(`${this.baseURL}/cex-token/queryList`, {
      query,
      page,
      sort,
    }) as Observable<CexTokenDaily[]>;
  }

  queryCount(query?: FilterQuery<CexToken>): Observable<number> {
    return this.httpClient.post(`${this.baseURL}/cex-token/queryCount`, {
      query,
    }) as Observable<number>;
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete(
      `${this.baseURL}/cex-token/${id}`
    ) as Observable<number>;
  }
}
