import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AirdropAccountAttendJob } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class AirdropAccountAttendJobService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<AirdropAccountAttendJob>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-account-attend-job/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<AirdropAccountAttendJob>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-account-attend-job/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: FilterQuery<AirdropAccountAttendJob>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<AirdropAccountAttendJob[]> {
    return this.httpClient.post<AirdropAccountAttendJob[]>(
      `${this.baseURL}/airdrop-account-attend-job/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<AirdropAccountAttendJob>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/airdrop-account-attend-job/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/airdrop-account-attend-job/${id}`);
  }

  encrypt(
    text: string, key: string
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-account-attend-job/encrypt`,
      { text, key }
    );
  }

  decrypt(
    encryptedText: string, key: string
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-account-attend-job/decrypt`,
      { encryptedText, key }
    );
  }
}
