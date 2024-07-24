import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CMCTokenPriceChange } from '../models/cmc-token-price-change.model';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class CMCTokenPriceChangeService {
  private readonly baseURL = environment.baseURL;

  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CMCTokenPriceChange>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CMCTokenPriceChange[]> {
    return this.httpClient.post<CMCTokenPriceChange[]>(
      `${this.baseURL}/cmc-token-price-change/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CMCTokenPriceChange>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cmc-token-price-change/queryCount`,
      {
        query,
      }
    );
  }

  update(
    id: string | undefined,
    record: Partial<CMCTokenPriceChange>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/cmc-token-price-change/update`,
      {
        id,
        record,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cmc-token-price-change/${id}`);
  }
}
