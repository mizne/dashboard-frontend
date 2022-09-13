export interface CexTokenTag {
  readonly _id: string;
  readonly name: string;
  readonly label: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}

export const tokenTagNameOfTotalMarket = '___total_market___';
export const tokenTagLabelOfTotalMarket = '全市场';
