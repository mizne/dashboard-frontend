import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FundRaise } from '../models/fund-raise.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class FundRaiseService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) {}

  queryList(
    query?: Partial<FundRaise>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<FundRaise[]> {
    return this.httpClient.post<FundRaise[]>(
      `${this.baseURL}/fund-raises/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<FundRaise>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/fund-raises/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/fund-raises/${id}`);
  }
}
