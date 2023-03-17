export enum NotifyObserverTypes {
  MEDIUM = 'MEDIUM',
  MIRROR = 'MIRROR',
  TWITTER = 'TWITTER',
  TWITTER_SPACE = 'TWITTER_SPACE',
  QUEST3 = 'QUEST3',
  QUEST3_PENDING = 'QUEST3_PENDING',
  QUEST3_CLAIMABLE = 'QUEST3_CLAIMABLE',
  QUEST3_RECOMMEND = 'QUEST3_RECOMMEND',
  LINK3 = 'LINK3',
  LINK3_RECOMMEND = 'LINK3_RECOMMEND',
  LINK3_CLAIMABLE = 'LINK3_CLAIMABLE',
  GALXE = 'GALXE',
  GALXE_RECOMMEND = 'GALXE_RECOMMEND',
  GALXE_CLAIMABLE = 'GALXE_CLAIMABLE',
  CWALLET = 'CWALLET',
  TIMER = 'TIMER',
  CMC_AIRDROP = 'CMC_AIRDROP',
  CMC_LEARN_AND_EARN = 'CMC_LEARN_AND_EARN',
  RISK_ALERT = 'RISK_ALERT',
  SNAPSHOT = 'SNAPSHOT',
  GUILD = 'GUILD',
  XIAOYUZHOU = 'XIAOYUZHOU',
  SOQUEST = 'SOQUEST',
  SUBSTACK = 'SUBSTACK',
  FUNDING_RAISE = 'FUNDING_RAISE',
  FREE_NFT_RECOMMEND = 'FREE_NFT_RECOMMEND',
  RABBITHOLE_RECOMMEND = 'RABBITHOLE_RECOMMEND',
  WOM_PEG = 'WOM_PEG',
  TOKEN_TRANSFER = 'TOKEN_TRANSFER',
  MARKET = 'MARKET',
  GHOST = 'GHOST',
  BLOG = 'BLOG'
}

export interface NotifyObserver {
  readonly _id: string;
  type: NotifyObserverTypes;
  enableTracking: boolean; // 开启追踪数据
  notifyShowTitle?: string;
  logo?: string;
  followedProjectID?: string;
  followedProjectLogo?: string;

  mediumHomeLink?: string;
  mediumTitleKey?: string;

  mirrorHomeLink?: string;
  mirrorTitleKey?: string;

  twitterHomeLink?: string;
  twitterTitleKey?: string;
  twitterTitleKeyWithDefault?: boolean;
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
  timerOnce?: boolean;
  timerEnableScript?: boolean;
  timerScript?: string;
  timerEnableStatistics?: boolean;
  timerStatisticsDefinitions?: Array<{
    name: string;
    version: number;
    fields: string[];
  }>
  timerLogo?: string;

  soQuestHomeLink?: string;
  soQuestTitleKey?: string;

  substackHomeLink?: string;
  substackTitleKey?: string;

  link3HomeLink?: string;
  link3TitleKey?: string;

  ghostHomeLink?: string;
  ghostTitleKey?: string;

  blogURL?: string;
  blogScript?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
