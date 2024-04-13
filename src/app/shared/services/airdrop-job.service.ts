import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AirdropJob } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AirdropJobService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<AirdropJob>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-job/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<AirdropJob>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-job/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<AirdropJob>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<AirdropJob[]> {
    return this.httpClient.post<AirdropJob[]>(
      `${this.baseURL}/airdrop-job/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<AirdropJob>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/airdrop-job/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/airdrop-job/${id}`);
  }
}