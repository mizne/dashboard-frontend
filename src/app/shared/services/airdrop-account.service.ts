import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AirdropAccount } from '../models';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class AirdropAccountService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) { }

  create(
    params: Partial<AirdropAccount>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-account/create`,
      params
    );
  }

  update(
    id: string | undefined,
    record: Partial<AirdropAccount>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-account/update`,
      {
        id,
        record,
      }
    );
  }

  queryList(
    query?: FilterQuery<AirdropAccount>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<AirdropAccount[]> {
    return this.httpClient.post<AirdropAccount[]>(
      `${this.baseURL}/airdrop-account/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<AirdropAccount>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/airdrop-account/queryCount`,
      {
        query,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/airdrop-account/${id}`);
  }

  encrypt(
    text: string, key: string
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-account/encrypt`,
      { text, key }
    );
  }

  decrypt(
    encryptedText: string, key: string
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/airdrop-account/decrypt`,
      { encryptedText, key }
    );
  }
}
