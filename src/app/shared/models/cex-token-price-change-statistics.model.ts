export interface CexTokenPriceChangeStatistics {
  readonly _id: string;
  readonly inDays: number; // 多少天内

  readonly avgCurrentPriceRelative: number // 所有标的 的平均当前价位
  readonly avgCurrentPriceRelativeRanking: number // 所有标的 的平均当前价位 排行, 数值越小 表示平均当前价位越低

  readonly avgPriceChangePercent: number; // 所有标的 的平均涨跌幅
  readonly avgPriceChangePercentRanking: number; // 所有标的 的平均涨跌幅 排行, 数值越小 表示平均涨跌幅越低

  readonly time: number;
  readonly timeStr: string;

  readonly updatedAt?: number;
  readonly updatedAtStr?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}


