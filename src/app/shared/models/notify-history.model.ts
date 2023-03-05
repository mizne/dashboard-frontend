import { NotifyObserverTypes } from './notify-observer.model';

export interface NotifyHistory {
  readonly _id: string;
  type: NotifyObserverTypes;

  title: string;
  desc: string;
  link?: string;
  logo?: string;
  followedProjectID?: string;
  followedProjectLogo?: string;
  hasRead: boolean;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
