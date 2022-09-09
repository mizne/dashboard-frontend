import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class SharedService {
  private readonly baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) {}

  checkConnections(): Observable<
    Array<{ hostname: string; status: 'success' | 'error'; message: string }>
  > {
    return this.httpClient.post(
      `${this.baseURL}/app/check-connections`,
      {}
    ) as Observable<
      Array<{ hostname: string; status: 'success' | 'error'; message: string }>
    >;
  }

  btcFutures(): Observable<{
    prices: number[];
    fundingRates: number[];
    longShortRatios: number[];
    openInterests: number[];
  }> {
    return this.httpClient.post(
      `${this.baseURL}/app/btc-futures`,
      {}
    ) as Observable<{
      prices: number[];
      fundingRates: number[];
      longShortRatios: number[];
      openInterests: number[];
    }>;
  }
}
