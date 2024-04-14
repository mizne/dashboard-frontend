
export interface AirdropAccountAttendJob {
  readonly _id: string;
  airdropAccountID: string;
  airdropJobID: string;

  remark?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
