import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CMCTokenDaily } from '../models/cmc-token-daily.model';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class CMCTokenDailyService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CMCTokenDaily>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CMCTokenDaily[]> {
    return this.httpClient
      .post<CMCTokenDaily[]>(`${this.baseURL}/cmc-token-daily/queryList`, {
        query,
        page,
        sort,
      })
      .pipe(
        map((results) => {
          return results.map((e) => ({
            ...e,
          }));
        })
      );
  }

  queryCount(query?: FilterQuery<CMCTokenDaily>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cmc-token-daily/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cmc-token-daily/${id}`);
  }
}
