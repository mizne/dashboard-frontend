import { ProjectService } from './project.service';
import { SharedService } from './shared.service';
import { KlineIntervalService } from './kline-interval.service';
import { TimerService } from './timer.service';
import { WebsocketService } from './websocket.service';
import { SystemNotificationService } from './system-notification.service';

export * from './project.service';
export * from './shared.service';
export * from './kline-interval.service';
export * from './timer.service';
export * from './websocket.service';
export * from './system-notification.service';

export const services = [
  ProjectService,
  SharedService,
  KlineIntervalService,
  TimerService,
  WebsocketService,
  SystemNotificationService,
];
