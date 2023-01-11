export interface FollowedProject {
  readonly _id: string;
  name: string;
  website?: string;
  logo?: string;

  description?: string;
  tagIDs?: string[];

  twitterHomeLink: string;
  telegramHomeLink: string;
  discordHomeLink: string;
  mediumHomeLink: string;
  youtubeHomeLink: string;
  mirrorHomeLink: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
