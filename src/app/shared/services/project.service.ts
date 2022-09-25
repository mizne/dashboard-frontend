import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) {}

  create(
    params: Partial<Project>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/projects/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<Project>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/projects/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<Project>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<Project[]> {
    return this.httpClient.post<Project[]>(
      `${this.baseURL}/projects/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<Project>): Observable<number> {
    return this.httpClient.post<number>(`${this.baseURL}/projects/queryCount`, {
      query,
    });
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/projects/${id}`);
  }
}
