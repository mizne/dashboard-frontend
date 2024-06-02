import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotifyObserverNotAllow, NotifyObserverTypes } from '../models';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterQuery } from 'src/app/shared';

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
    query?: FilterQuery<NotifyObserverNotAllow>,
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

  queryCount(query?: FilterQuery<NotifyObserverNotAllow>): Observable<number> {
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
    ).pipe(
      map(results => {
        return results.sort((a, b) => {
          if (a.label < b.label) {
            return -1
          } else if (a.label > b.label) {
            return 1;
          } else {
            return 0;
          }

        })
      })
    );
  }
}
