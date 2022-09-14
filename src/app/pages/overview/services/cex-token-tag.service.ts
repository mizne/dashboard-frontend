import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexTokenTag } from '../models/cex-token-tag.model';
import { FilterQuery } from 'src/app/shared';

@Injectable()
export class CexTokenTagService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) {}

  queryList(
    query?: FilterQuery<CexTokenTag>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexTokenTag[]> {
    return this.httpClient.post(`${this.baseURL}/cex-token-tag/queryList`, {
      query,
      page,
      sort,
    }) as Observable<CexTokenTag[]>;
  }

  queryCount(query?: FilterQuery<CexTokenTag>): Observable<number> {
    return this.httpClient.post(`${this.baseURL}/cex-token-tag/queryCount`, {
      query,
    }) as Observable<number>;
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete(
      `${this.baseURL}/cex-token-tag/${id}`
    ) as Observable<number>;
  }
}
