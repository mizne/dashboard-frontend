import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexFutureDaily } from '../models/cex-future-daily.model';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class CexFutureDailyService {
  private readonly baseURL = environment.baseURL;

  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CexFutureDaily>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexFutureDaily[]> {
    return this.httpClient.post<CexFutureDaily[]>(
      `${this.baseURL}/cex-future-daily/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexFutureDaily>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-future-daily/queryCount`,
      {
        query,
      }
    );
  }

  update(
    id: string | undefined,
    record: Partial<CexFutureDaily>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/cex-future-daily/update`,
      {
        id,
        record,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cex-future-daily/${id}`);
  }
}
