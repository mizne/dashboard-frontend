import { KlineIntervals } from 'src/app/shared';

export interface CexTokenTagDaily {
  readonly _id: string;
  readonly name: string;
  readonly label: string;

  readonly interval: KlineIntervals;

  readonly tokenNames: string[];
  readonly volume: number;
  readonly volumes180Interval: number[];

  readonly volumePercents: Array<{ token: string; percent: number }>;

  readonly volumeMultiple: number; // 交易量 相对 以前很多周期平均值（去除最大最小值） 的倍数
  readonly volumeIntervals: number; // 相对以前的周期数

  readonly time: number;
  readonly timeStr: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
