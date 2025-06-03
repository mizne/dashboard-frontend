import { KlineIntervals } from "src/app/shared";

export enum CexFutureAlertTypes {
  FUNDING_RATE_LIMIT = 'FUNDING_RATE_LIMIT',
  OPEN_INTEREST_LIMIT = 'OPEN_INTEREST_LIMIT',
  OPEN_INTEREST_AND_CIRCULAR_SUPPLY_RATIO_LIMIT = 'OPEN_INTEREST_AND_CIRCULAR_SUPPLY_RATIO_LIMIT',
  LONG_SHORT_RATIO_LIMIT = 'LONG_SHORT_RATIO_LIMIT',
}

export enum CexFutureAlertDirections {
  LONG = 'LONG',
  SHORT = 'SHORT',
  SHOCK = 'SHOCK'
}

export interface CexFutureAlert {
  readonly _id: string;
  readonly type: CexFutureAlertTypes;
  readonly direction: CexFutureAlertDirections;

  readonly symbol: string;
  readonly desc: string;
  readonly interval: KlineIntervals;
  readonly time: number;
  readonly timeStr: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
