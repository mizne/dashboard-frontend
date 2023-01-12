import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FollowedProject } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FollowedProjectService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<FollowedProject>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/followed-project/create`,
      {
        ...params,
        hasNews: false
      }
    );
  }

  update(
    id: string | undefined,
    record: Partial<FollowedProject>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/followed-project/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<FollowedProject>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<FollowedProject[]> {
    return this.httpClient.post<FollowedProject[]>(
      `${this.baseURL}/followed-project/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<FollowedProject>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/followed-project/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/followed-project/${id}`);
  }
}
