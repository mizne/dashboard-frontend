import { KlineIntervals } from "src/app/shared";

export enum CexFutureAlertTypes {
  FUNDING_RATE_LIMIT = 'FUNDING_RATE_LIMIT',
  OPEN_INTEREST_LIMIT = 'OPEN_INTEREST_LIMIT',
  LONG_SHORT_RATIO_LIMIT = 'LONG_SHORT_RATIO_LIMIT',
}

export interface CexFutureAlert {
  readonly _id: string;
  readonly type: CexFutureAlertTypes;

  readonly symbol: string;
  readonly desc: string;
  readonly interval: KlineIntervals;
  readonly time: number;
  readonly timeStr: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
