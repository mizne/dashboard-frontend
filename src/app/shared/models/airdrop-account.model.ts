
export interface AirdropAccount {
  readonly _id: string;

  name: string;
  logo?: string;
  remark?: string;

  evmWalletAddress?: string;
  solWalletAddress?: string;

  gmailName?: string;
  gmailPassword?: string;

  twitterName?: string;
  twitterPassword?: string;

  discordName?: string;
  discordPassword?: string;

  galxeName?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
