import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralTable } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class GeneralTableService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<GeneralTable>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/general-table/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<GeneralTable>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/general-table/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: FilterQuery<GeneralTable>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<GeneralTable[]> {
    return this.httpClient.post<GeneralTable[]>(
      `${this.baseURL}/general-table/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<GeneralTable>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/general-table/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/general-table/${id}`);
  }
}
