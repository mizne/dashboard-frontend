export const AVAILABLE_CEX_TOKEN_VOLUME_RANKING_IN_DAYS_LIST = [1, 3, 7, 15, 30]

export interface CexTokenVolumeRankingStatistics {
  readonly _id: string;
  readonly symbol: string;
  readonly name: string;
  readonly fullname: string;

  readonly slug: string;

  readonly logo: string;
  readonly logoName: string;
  readonly tags: Array<string>;

  readonly marketCap: number;

  readonly inDays: number; // 最近多少天
  countInRanking: number; // 上榜次数

  readonly createdAt: number;
  readonly createdAtStr: string;
}


