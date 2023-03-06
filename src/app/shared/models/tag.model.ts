export enum TagTypes {
  FOLLOWED_PROJECT_CATEGORY = 'FOLLOWED_PROJECT_CATEGORY',
  TRACKING_RECORD_CATEGORY = 'TRACKING_RECORD_CATEGORY',
}

export interface Tag {
  readonly _id: string;
  type: TagTypes;
  text: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
