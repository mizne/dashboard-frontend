import { KlineIntervals } from 'src/app/shared';

export interface CMCTokenDaily {
  readonly _id: string;
  readonly symbol: string;
  readonly name: string;
  readonly slug: string;

  readonly price: number;
  readonly marketCap: number;
  readonly marketCapRanking: number;
  readonly circulatingSupply: number;
  readonly totalSupply: number;

  readonly interval: KlineIntervals;
  readonly time: number;
  readonly timeStr: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
