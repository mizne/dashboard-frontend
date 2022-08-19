export interface Project {
  readonly _id: string;
  name: string;
  website: string;

  description: string;
  investors: string[];

  twitterHomeLink: string;
  telegramHomeLink: string;
  discordHomeLink: string;
  mediumHomeLink: string;
  youtubeHomeLink: string;

  tokens: Array<{ chain: string; name: string; address: string }>;
  contracts: Array<{ chain: string; name: string; address: string }>;

  enableTracking: boolean; // 开启追踪数据

  readonly createdAt: number;
  readonly createdAtStr: string;
}
