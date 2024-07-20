export interface CexTokenPriceChange {
  readonly _id: string;
  readonly symbol: string;
  readonly name: string;
  readonly fullname: string;

  readonly slug: string;

  readonly logo: string;
  readonly logoName: string;
  readonly tags: Array<string>;

  readonly marketCap: number;
  readonly marketCapRanking?: number;

  readonly website?: string;
  readonly twitter?: string;

  readonly inDays: number; // 多少天内 [3, 7, 15, 30, 60, 90, 180, 360, 540];
  readonly currentPrice: number; // 当前价格

  readonly currentPriceRelative: number // 当前价格在 最低、最高之间的相对位置 [0, 1] 譬如0.3表示 0代表最低价格 1代表最高价格 0.3代表当前价格
  readonly maxPrice: number; // 周期内最高价格
  readonly minPrice: number; // 周期内最低价格
  readonly maxPriceAt: number; // 最高价格的日期
  readonly minPriceAt: number; // 最低价格的日期
  readonly priceChangePercent: number; // 涨跌幅百分比 譬如涨幅 1.23表示最低到最高涨了123%；跌幅 -0.87表示最高到最低跌了87%

  readonly updatedAt?: number;
  readonly updatedAtStr?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}

