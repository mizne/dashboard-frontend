export enum AirdropJobStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  HAS_ENDED = 'HAS_ENDED',
}

export interface AirdropJob {
  readonly _id: string;
  title: string;
  status: AirdropJobStatus;
  remark?: string;
  link?: string;
  logo?: string;

  followedProjectID?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
