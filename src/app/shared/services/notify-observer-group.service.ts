import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotifyObserverGroup } from '../models';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class NotifyObserverGroupService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<NotifyObserverGroup>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/notify-observer-group/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<NotifyObserverGroup>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/notify-observer-group/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<NotifyObserverGroup>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<NotifyObserverGroup[]> {
    return this.httpClient.post<NotifyObserverGroup[]>(
      `${this.baseURL}/notify-observer-group/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<NotifyObserverGroup>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/notify-observer-group/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/notify-observer-group/${id}`);
  }
}
