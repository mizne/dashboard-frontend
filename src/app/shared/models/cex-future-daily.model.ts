import { KlineIntervals } from 'src/app/shared';
import { ContractTypes } from './cex-future.model';

export interface CexFutureDaily {
  readonly _id: string;
  readonly symbol: string;
  readonly baseAsset: string;

  readonly contractType: ContractTypes;
  readonly logoName: string;

  readonly interval: KlineIntervals;
  readonly time: number;
  readonly timeStr: string;

  readonly fundingRate: number;
  readonly openInterest: number;
  readonly longShortRatio: number;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
