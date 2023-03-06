export interface FollowedProjectTrackingRecord {
  readonly _id: string;
  title: string;
  logo?: string;
  description?: string;
  tagIDs?: string[];
  link?: string;
  followedProjectID?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
