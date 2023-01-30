import { NotifyObserverTypes } from './notify-observer.model';

export interface NotifyObserverNotAllow {
  readonly _id: string;
  type: NotifyObserverTypes;

  url: string;
  blockCount: number;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
