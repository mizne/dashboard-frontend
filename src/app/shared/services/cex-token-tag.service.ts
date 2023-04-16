import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexTokenTag } from '../models/cex-token-tag.model';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class CexTokenTagService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CexTokenTag>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexTokenTag[]> {
    return this.httpClient.post<CexTokenTag[]>(
      `${this.baseURL}/cex-token-tag/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexTokenTag>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-token-tag/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cex-token-tag/${id}`);
  }
}
