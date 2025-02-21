import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CexFuture } from '../models/cex-future.model';
import { FilterQuery } from 'src/app/shared';

@Injectable({ providedIn: 'root' })
export class CexFutureService {
  private readonly baseURL = environment.baseURL;

  constructor(private httpClient: HttpClient) { }

  queryList(
    query?: FilterQuery<CexFuture>,
    page?: { number: number; size: number },
    sort?: any
  ): Observable<CexFuture[]> {
    return this.httpClient.post<CexFuture[]>(
      `${this.baseURL}/cex-future/queryList`,
      {
        query,
        page,
        sort,
      }
    );
  }

  queryCount(query?: FilterQuery<CexFuture>): Observable<number> {
    return this.httpClient.post<number>(
      `${this.baseURL}/cex-future/queryCount`,
      {
        query,
      }
    );
  }

  update(
    id: string | undefined,
    record: Partial<CexFuture>
  ): Observable<{ code: number; message: string; result: any }> {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/cex-future/update`,
      {
        id,
        record,
      }
    );
  }

  updateEnableLiquidationNotification(
    params: { id: string; symbol: string; enableLiquidationNotification: boolean; liquidationAmountLimit: number; },
  ) {
    return this.httpClient.post<{ code: number; message: string; result: any }>(
      `${this.baseURL}/cex-future/updateEnableLiquidationNotification`,
      {
        id: params.id,
        symbol: params.symbol,
        enableLiquidationNotification: params.enableLiquidationNotification,
        liquidationAmountLimit: params.liquidationAmountLimit,
      }
    );
  }

  deleteByID(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseURL}/cex-future/${id}`);
  }
}
