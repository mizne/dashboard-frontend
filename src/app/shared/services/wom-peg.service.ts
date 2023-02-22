import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WomPeg } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WomPegService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<WomPeg>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/wom-peg/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<WomPeg>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/wom-peg/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<WomPeg>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<WomPeg[]> {
    return this.httpClient.post<WomPeg[]>(
      `${this.baseURL}/wom-peg/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<WomPeg>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/wom-peg/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/wom-peg/${id}`);
  }
}
