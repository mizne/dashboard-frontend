import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalSettings } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GlobalSettingsService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<GlobalSettings>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/global-settings/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<GlobalSettings>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/global-settings/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<GlobalSettings>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<GlobalSettings[]> {
    return this.httpClient.post<GlobalSettings[]>(
      `${this.baseURL}/global-settings/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<GlobalSettings>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/global-settings/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/global-settings/${id}`);
  }
}
