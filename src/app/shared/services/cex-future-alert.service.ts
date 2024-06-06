import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexFutureAlert } from '../models/cex-future-alert.model';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class CexFutureAlertService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CexFutureAlert>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexFutureAlert[]> {
    return this.httpClient.post<CexFutureAlert[]>(
      `${this.baseURL}/cex-future-alert/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexFutureAlert>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-future-alert/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(
      `${this.baseURL}/cex-future-alert/${id}`
    );
  }
}
