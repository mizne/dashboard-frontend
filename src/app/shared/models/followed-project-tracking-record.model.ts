export interface FollowedProjectTrackingRecord {
  readonly _id: string;
  title: string;
  logo?: string;
  description?: string;
  link?: string;
  followedProjectID: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
