import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class ProjectService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) {}

  create(
    params: Partial<Project>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post(
      `${this.baseURL}/projects/create`,
      params
    ) as Observable<{ code: number; message: string; result: any }>;
  }

  update(
    id: string | undefined,
    record: Partial<Project>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post(`${this.baseURL}/projects/update`, {
      id,
      record,
    }) as Observable<{ code: number; message: string; result: any }>;
  }

  queryList(
    query?: Partial<Project>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<Project[]> {
    return this.httpClient.post(`${this.baseURL}/projects/queryList`, {
      query,
      page,
      sort,
    }) as Observable<Project[]>;
  }

  queryCount(query?: Partial<Project>): Observable<number> {
    return this.httpClient.post(`${this.baseURL}/projects/queryCount`, {
      query,
    }) as Observable<number>;
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete(
      `${this.baseURL}/projects/${id}`
    ) as Observable<number>;
  }
}
