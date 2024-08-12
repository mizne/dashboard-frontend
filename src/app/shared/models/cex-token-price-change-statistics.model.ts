export interface CexTokenPriceChangeStatistics {
  readonly _id: string;
  readonly inDays: number; // 多少天内

  readonly avgCurrentPriceRelative: number // 所有标的 的平均 当前价位

  readonly avgPriceChangePercent: number; // 所有标的 的平均 涨跌幅

  readonly time: number;
  readonly timeStr: string;

  readonly updatedAt?: number;
  readonly updatedAtStr?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}


