import { KlineIntervals } from 'src/app/shared';

export interface CexTokenTagAlert {
  readonly _id: string;
  readonly name: string;
  readonly label: string;

  readonly interval: KlineIntervals;
  readonly time: number;
  readonly timeStr: string;

  readonly closeAboveEma21Ratio: number; //  收盘价格 在 21均线之上的 token占比
  readonly closeAboveEma55Ratio: number; //  收盘价格 在 55均线之上的 token占比
  readonly closeAboveEma144Ratio: number; //  收盘价格 在 144均线之上的 token占比

  readonly longRatio: number; // 多头占比
  readonly shockRatio: number; // 震荡占比
  readonly shortRatio: number;  // 空投占比

  readonly createdAt: number;
  readonly createdAtStr: string;
}
