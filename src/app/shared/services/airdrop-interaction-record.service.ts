import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AirdropInteractionRecord } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AirdropInteractionRecordService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<AirdropInteractionRecord>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-interaction-record/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<AirdropInteractionRecord>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-interaction-record/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: Partial<AirdropInteractionRecord>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<AirdropInteractionRecord[]> {
    return this.httpClient.post<AirdropInteractionRecord[]>(
      `${this.baseURL}/airdrop-interaction-record/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: Partial<AirdropInteractionRecord>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/airdrop-interaction-record/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/airdrop-interaction-record/${id}`);
  }
}
