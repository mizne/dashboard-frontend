export enum DailyInterval {
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
}

export interface CexTokenDaily {
  readonly _id: string;
  readonly symbol: string;
  readonly name: string;
  readonly fullname: string;

  readonly slug: string;

  readonly logo: string;
  readonly tags: Array<string>;

  readonly interval: DailyInterval;

  readonly price: number;
  readonly volume: number;

  readonly priceChange1Interval: number; // 价格变化 1周期
  readonly priceChange7Interval: number; // 价格变化 7周期
  readonly priceChange30Interval: number; // 价格变化 30周期

  readonly prices60Interval: number[]; // 价格序列 60周期
  readonly volumes60Interval: number[]; // 交易量序列 60周期

  readonly priceChange1IntervalRelativeBTC: number; // 价格变化 相对btc价格变化 1周期
  readonly priceChange7IntervalRelativeBTC: number; // 价格变化 相对btc价格变化 7周期
  readonly priceChange30IntervalRelativeBTC: number; // 价格变化 相对btc价格变化 30周期

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