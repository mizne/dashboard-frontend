import { KlineIntervals } from 'src/app/shared';
import { ContractTypes } from './cex-future.model';

export interface CexFutureDaily {
  readonly _id: string;
  readonly symbol: string;
  readonly pair: string;
  readonly baseAsset: string;

  readonly contractType: ContractTypes;
  readonly logoName: string;

  readonly interval: KlineIntervals;
  readonly time: number;
  readonly timeStr: string;

  readonly price: number;
  readonly fundingRate: number;
  readonly openInterest: number;
  readonly longShortRatio: number;

  readonly openInterestRelative21: number;
  readonly openInterestRelative55: number;

  readonly priceBetweenMinMaxRelative21: number;
  readonly priceBetweenMinMaxRelative55: number;
  readonly priceBetweenMinMaxRelative144: number;
  // readonly priceBetweenMinMaxRelative377: number;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
