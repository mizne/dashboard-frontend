import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexToken } from '../models/cex-token.model';
import { FilterQuery } from 'src/app/shared';

@Injectable()
export class CexTokenService {
  private readonly baseURL = environment.baseURL;

  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CexToken>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexToken[]> {
    return this.httpClient.post<CexToken[]>(
      `${this.baseURL}/cex-token/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexToken>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-token/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cex-token/${id}`);
  }
}
