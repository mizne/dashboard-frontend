import { NotifyObserverTypes } from './notify-observer.model';

export interface NotifyHistory {
  readonly _id: string;
  type: NotifyObserverTypes;
  enableTracking: boolean; // 开启追踪数据
  title: string;
  desc: string;
  link?: string;
  hasRead: boolean;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
