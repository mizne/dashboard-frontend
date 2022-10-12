export enum NotifyObserverTypes {
  MEDIUM = 'MEDIUM',
  MIRROR = 'MIRROR',
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

  readonly createdAt: number;
  readonly createdAtStr: string;
}
