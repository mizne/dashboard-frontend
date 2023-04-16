import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexTokenTagDaily } from '../models/cex-token-tag-daily.model';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class CexTokenTagDailyService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CexTokenTagDaily>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexTokenTagDaily[]> {
    return this.httpClient.post<CexTokenTagDaily[]>(
      `${this.baseURL}/cex-token-tag-daily/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexTokenTagDaily>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-token-tag-daily/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(
      `${this.baseURL}/cex-token-tag-daily/${id}`
    );
  }
}
