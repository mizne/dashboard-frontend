import { KlineIntervals } from 'src/app/shared';

export interface CexTokenDaily {
  readonly _id: string;
  readonly symbol: string;
  readonly name: string;
  readonly fullname: string;

  readonly slug: string;

  readonly logo: string;
  readonly logoName: string;
  readonly tags: Array<string>;

  readonly marketCap: number;

  readonly interval: KlineIntervals;

  readonly price: number;
  readonly volume: number;

  readonly prices60Interval: number[]; // 价格序列 60周期
  readonly volumes60Interval: number[]; // 交易量序列 60周期

  readonly closeDeltaEma21: number; // 当前收盘价相对ema21
  readonly ema21DeltaEma55: number; // ema21相对ema55
  readonly ema55DeltaEma144: number; // ema21相对ema144

  readonly volumeMultiple: number; // 交易量 相对 以前很多周期平均值（去除最大最小值） 的倍数
  readonly volumeIntervals: number; // 相对以前的周期数

  readonly emaCompressionRelative: number; // ema均线的密集程度 [0, 1] 越小表示越密集

  readonly time: number;
  readonly timeStr: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
