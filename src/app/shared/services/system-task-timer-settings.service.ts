import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SystemTaskTimerSettings } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SystemTaskTimerSettingsService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<SystemTaskTimerSettings>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/system-task-timer-settings/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<SystemTaskTimerSettings>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/system-task-timer-settings/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<SystemTaskTimerSettings>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<SystemTaskTimerSettings[]> {
    return this.httpClient.post<SystemTaskTimerSettings[]>(
      `${this.baseURL}/system-task-timer-settings/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<SystemTaskTimerSettings>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/system-task-timer-settings/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/system-task-timer-settings/${id}`);
  }
}
