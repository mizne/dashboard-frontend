export interface CMCToken {
  readonly _id: string;
  readonly symbol: string;
  readonly name: string;
  readonly slug: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
