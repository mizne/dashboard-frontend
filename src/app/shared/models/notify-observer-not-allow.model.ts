import { NotifyObserverTypes } from './notify-observer.model';

export interface NotifyObserverNotAllow {
  readonly _id: string;
  type: NotifyObserverTypes;

  url: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
