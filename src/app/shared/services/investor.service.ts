import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Investor } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class InvestorService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<Investor>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/investor/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<Investor>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/investor/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: FilterQuery<Investor>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<Investor[]> {
    return this.httpClient.post<Investor[]>(
      `${this.baseURL}/investor/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<Investor>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/investor/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/investor/${id}`);
  }
}
