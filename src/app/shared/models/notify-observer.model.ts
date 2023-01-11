export enum NotifyObserverTypes {
  MEDIUM = 'MEDIUM',
  MIRROR = 'MIRROR',
  TWITTER = 'TWITTER',
  TWITTER_SPACE = 'TWITTER_SPACE',
  QUEST3 = 'QUEST3',
  QUEST3_PENDING = 'QUEST3_PENDING',
  QUEST3_CLAIMABLE = 'QUEST3_CLAIMABLE',
  QUEST3_RECOMMEND = 'QUEST3_RECOMMEND',
  BNBCHAIN_BLOG = 'BNBCHAIN_BLOG',
  BINANCE_BLOG = 'BINANCE_BLOG',
  LINK3 = 'LINK3',
  GALXE = 'GALXE',
  GALXE_RECOMMEND = 'GALXE_RECOMMEND',
  GALXE_CLAIMABLE = 'GALXE_CLAIMABLE',
  CWALLET = 'CWALLET',
  TIMER = 'TIMER',
  CMC_AIRDROP = 'CMC_AIRDROP',
  CMC_LEARN_AND_EARN = 'CMC_LEARN_AND_EARN',
  SNAPSHOT = 'SNAPSHOT',
  GUILD = 'GUILD',
  XIAOYUZHOU = 'XIAOYUZHOU'
}

export interface NotifyObserver {
  readonly _id: string;
  type: NotifyObserverTypes;
  enableTracking: boolean; // 开启追踪数据
  notifyShowTitle?: string;
  logo?: string;
  followedProjectID?: string;

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

  snapshotHomeLink?: string;
  snapshotTitleKey?: string;

  guildHomeLink?: string;
  guildTitleKey?: string;

  xiaoyuzhouHomeLink?: string;
  xiaoyuzhouTitleKey?: string;

  timerHour?: number[];
  timerMinute?: number[];
  timerDate?: number[];
  timerMonth?: number[];

  timerNotifyShowDesc?: string;
  timerNotifyShowUrl?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
