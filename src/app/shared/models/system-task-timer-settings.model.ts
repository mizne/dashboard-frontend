import { NotifyObserverTypes } from './notify-observer.model'

export interface SystemTaskTimerSettings {
  readonly _id: string;
  type: NotifyObserverTypes;

  timerHour?: number[];
  timerMinute?: number[];
  timerDate?: number[];
  timerMonth?: number[];
  timerDayOfWeek?: number[];

  readonly createdAt: number;
  readonly createdAtStr: string;
}
