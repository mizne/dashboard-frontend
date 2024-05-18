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

  readonly contractType: ContractTypes;
  readonly logoName: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
