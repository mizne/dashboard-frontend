import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotifyHistory } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class NotifyHistoryService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) {}

  create(
    params: Partial<NotifyHistory>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/notify-history/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<NotifyHistory>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/notify-history/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<NotifyHistory>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<NotifyHistory[]> {
    return this.httpClient.post<NotifyHistory[]>(
      `${this.baseURL}/notify-history/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<NotifyHistory>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/notify-history/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/notify-history/${id}`);
  }
}