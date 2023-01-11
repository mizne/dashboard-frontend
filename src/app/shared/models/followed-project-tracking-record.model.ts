export interface FollowedProjectTrackingRecord {
  readonly _id: string;
  title: string;
  description?: string;
  link?: string;
  followedProjectID: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
