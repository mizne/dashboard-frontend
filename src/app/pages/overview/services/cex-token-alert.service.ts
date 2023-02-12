import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexTokenAlert } from '../models/cex-token-alert.model';
import { FilterQuery } from 'src/app/shared';

@Injectable()
export class CexTokenAlertService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CexTokenAlert>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexTokenAlert[]> {
    return this.httpClient.post<CexTokenAlert[]>(
      `${this.baseURL}/cex-token-alert/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexTokenAlert>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-token-alert/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(
      `${this.baseURL}/cex-token-alert/${id}`
    );
  }
}
