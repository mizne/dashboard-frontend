import { KlineIntervals } from "src/app/shared";

export enum CexTokenAlertTypes {
  BIG_VOLUME = 'BIG_VOLUME',
  TRENDING_CHANGE = 'TRENDING_CHANGE'
}

export interface CexTokenAlert {
  readonly _id: string;
  readonly type: CexTokenAlertTypes;

  readonly symbol: string;
  readonly desc: string;
  readonly interval: KlineIntervals;
  readonly time: number;
  readonly timeStr: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
