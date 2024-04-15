export interface AirdropInteractionRecord {
  readonly _id: string;
  title: string;
  description?: string;
  tagIDs?: string[];
  link?: string;
  airdropAccountID: string;
  airdropJobID: string;

  airdropAccountLogo: string;
  airdropJobLogo: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
