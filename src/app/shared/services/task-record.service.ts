import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskRecord } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskRecordService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<TaskRecord>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/task-record/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<TaskRecord>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/task-record/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<TaskRecord>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<TaskRecord[]> {
    return this.httpClient.post<TaskRecord[]>(
      `${this.baseURL}/task-record/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<TaskRecord>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/task-record/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/task-record/${id}`);
  }
}
