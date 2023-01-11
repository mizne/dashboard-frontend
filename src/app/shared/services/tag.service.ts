import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tag } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<Tag>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/tag/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<Tag>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/tag/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<Tag>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<Tag[]> {
    return this.httpClient.post<Tag[]>(
      `${this.baseURL}/tag/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<Tag>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/tag/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/tag/${id}`);
  }
}
