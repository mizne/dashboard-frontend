import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FollowedProjectTrackingRecord } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class FollowedProjectTrackingRecordService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<FollowedProjectTrackingRecord>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/followed-project-tracking-record/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<FollowedProjectTrackingRecord>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/followed-project-tracking-record/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: FilterQuery<FollowedProjectTrackingRecord>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<FollowedProjectTrackingRecord[]> {
    return this.httpClient.post<FollowedProjectTrackingRecord[]>(
      `${this.baseURL}/followed-project-tracking-record/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<FollowedProjectTrackingRecord>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/followed-project-tracking-record/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/followed-project-tracking-record/${id}`);
  }
}
