export enum ContractTypes {
  PERPETUAL = "PERPETUAL",
  NEXT_QUARTER = "NEXT_QUARTER",
  CURRENT_QUARTER = "CURRENT_QUARTER",
}

export interface CexFuture {
  readonly _id: string;
  readonly symbol: string;
  readonly pair: string;
  readonly baseAsset: string;
  slug?: string;

  readonly contractType: ContractTypes;
  readonly logoName: string;
  readonly hasCollect: boolean;

  readonly enableLiquidationNotification?: boolean;
  readonly liquidationAmountLimit?: number;

  readonly marketCap?: number;
  readonly fullyDilutedMarketCap?: number;

  readonly circulatingSupply?: number;
  readonly totalSupply?: number;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
