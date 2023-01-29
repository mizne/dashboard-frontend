import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotifyObserverNotAllow, NotifyObserverTypes } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class NotifyObserverNotAllowService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<NotifyObserverNotAllow>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/notify-observer-not-allow/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<NotifyObserverNotAllow>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/notify-observer-not-allow/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<NotifyObserverNotAllow>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<NotifyObserverNotAllow[]> {
    return this.httpClient.post<NotifyObserverNotAllow[]>(
      `${this.baseURL}/notify-observer-not-allow/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<NotifyObserverNotAllow>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/notify-observer-not-allow/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/notify-observer-not-allow/${id}`);
  }

  queryTypes(): Observable<{ label: string; value: NotifyObserverTypes }[]> {
    return this.httpClient.post<{ label: string; value: NotifyObserverTypes }[]>(
      `${this.baseURL}/notify-observer-not-allow/queryTypes`,
      {}
    );
  }
}
