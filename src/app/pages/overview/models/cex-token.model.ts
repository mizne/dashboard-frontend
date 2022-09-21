export interface CexToken {
  readonly _id: string;
  readonly symbol: string;
  readonly name: string;
  readonly fullname: string;

  readonly slug: string;

  readonly logo: string;
  readonly logoName: string;
  readonly tags: Array<string>;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
