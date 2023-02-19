export interface Investor {
  readonly _id: string;

  name: string;

  cryptoFundraisingURL: string;
  rootDataPayload: { [key: string]: any };

  readonly createdAt: number;
  readonly createdAtStr: string;
}