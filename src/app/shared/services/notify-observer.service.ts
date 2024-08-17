import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotifyObserver, NotifyObserverTypes } from '../models';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class NotifyObserverService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<NotifyObserver>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/notify-observer/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<NotifyObserver>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/notify-observer/update`,
      {
        id,
        record,
      }
    );
  }

  timerExecute(
    id: string | undefined,
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/notify-observer/timer-execute`,
      {
        id,
      }
    );
  }

  queryList(
    query?: FilterQuery<NotifyObserver>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<NotifyObserver[]> {
    return this.httpClient.post<NotifyObserver[]>(
      `${this.baseURL}/notify-observer/queryList`,
      {
        query,
        page,
        sort,
      }
    ).pipe(
      map(items => {
        return items.map(e => {
          return {
            ...e,
            priceChangeToValue: typeof e.priceChangeToValue === 'number' ? [e.priceChangeToValue] : e.priceChangeToValue,
            priceChangeInDays: typeof e.priceChangeInDays === 'number' ? [e.priceChangeInDays] : e.priceChangeInDays,
          }
        })
      })
    );
  }

  queryCount(query?: FilterQuery<NotifyObserver>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/notify-observer/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/notify-observer/${id}`);
  }

  queryTypes(): Observable<{ label: string; value: NotifyObserverTypes }[]> {
    return this.httpClient.post<{ label: string; value: NotifyObserverTypes }[]>(
      `${this.baseURL}/notify-observer/queryTypes`,
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

  queryHookTypes(): Observable<{ label: string; value: string }[]> {
    return this.httpClient.post<{ label: string; value: string }[]>(
      `${this.baseURL}/notify-observer/queryHookTypes`,
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

  queryPriceChangeTypes(): Observable<{ label: string; value: string }[]> {
    return this.httpClient.post<{ label: string; value: string }[]>(
      `${this.baseURL}/notify-observer/queryPriceChangeTypes`,
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
