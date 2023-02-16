import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexTokenTagAlert } from '../models/cex-token-tag-alert.model';
import { FilterQuery } from 'src/app/shared';

@Injectable()
export class CexTokenTagAlertService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CexTokenTagAlert>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexTokenTagAlert[]> {
    return this.httpClient.post<CexTokenTagAlert[]>(
      `${this.baseURL}/cex-token-tag-alert/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexTokenTagAlert>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-token-tag-alert/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(
      `${this.baseURL}/cex-token-tag-alert/${id}`
    );
  }
}
