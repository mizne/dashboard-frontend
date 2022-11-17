export enum NotifyObserverTypes {
  MEDIUM = 'MEDIUM',
  MIRROR = 'MIRROR',
  TWITTER = 'TWITTER',
  TWITTER_SPACE = 'TWITTER_SPACE',
  QUEST3 = 'QUEST3',
  BNBCHAIN_BLOG = 'BNBCHAIN_BLOG',
  BINANCE_BLOG = 'BINANCE_BLOG',
  LINK3 = 'LINK3',
}

export interface NotifyObserver {
  readonly _id: string;
  type: NotifyObserverTypes;
  enableTracking: boolean; // 开启追踪数据
  notifyShowTitle?: string;

  mediumHomeLink?: string;
  mediumTitleKey?: string;

  mirrorHomeLink?: string;
  mirrorTitleKey?: string;

  twitterHomeLink?: string;
  twitterTitleKey?: string;
  twitterWithReply?: boolean;
  twitterWithLike?: boolean;

  twitterSpaceHomeLink?: string;
  twitterSpaceTitleKey?: string;

  quest3HomeLink?: string;
  quest3TitleKey?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
