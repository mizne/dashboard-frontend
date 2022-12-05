export enum NotifyObserverTypes {
  MEDIUM = 'MEDIUM',
  MIRROR = 'MIRROR',
  TWITTER = 'TWITTER',
  TWITTER_SPACE = 'TWITTER_SPACE',
  QUEST3 = 'QUEST3',
  BNBCHAIN_BLOG = 'BNBCHAIN_BLOG',
  BINANCE_BLOG = 'BINANCE_BLOG',
  LINK3 = 'LINK3',
  GALXE = 'GALXE',
  CWALLET = 'CWALLET',
  TIMER = 'TIMER',
  CMC_AIRDROP = 'CMC_AIRDROP',
  CMC_LEARN_AND_EARN = 'CMC_LEARN_AND_EARN',
}

export interface NotifyObserver {
  readonly _id: string;
  type: NotifyObserverTypes;
  enableTracking: boolean; // 开启追踪数据
  notifyShowTitle?: string;
  logo?: string;

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

  twitterWithFollowingsChange?: boolean;
  twitterFollowings?: string[];

  quest3HomeLink?: string;
  quest3TitleKey?: string;

  galxeHomeLink?: string;
  galxeTitleKey?: string;

  timerHour?: number[];
  timerMinute?: number[];

  timerNotifyShowDesc?: string;
  timerNotifyShowUrl?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
