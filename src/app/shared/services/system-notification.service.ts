import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({ providedIn: 'root' })
export class SystemNotificationService {
  constructor(private readonly nzNotificationService: NzNotificationService) {}

  notify(title: string, desc: string, click?: Function): Promise<Notification> {
    return this.checkPermission().then(() => {
      return this.realNotify(title, desc, click);
    });
  }

  private checkPermission(): Promise<void> {
    if (!('Notification' in window)) {
      const msg = 'This browser does not support desktop notification';
      this.nzNotificationService.error(`系统通知失败`, `${msg}`);
      return Promise.reject(new Error(msg));
    } else if (Notification.permission === 'granted') {
      return Promise.resolve();
    } else if (Notification.permission !== 'denied') {
      return Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          return Promise.resolve();
        } else {
          const msg = `user denied permission`;
          this.nzNotificationService.error(`系统通知失败`, `${msg}`);
          return Promise.reject(new Error(msg));
        }
      });
    } else {
      const msg = `user denied permission`;
      this.nzNotificationService.error(`系统通知失败`, `${msg}`);
      return Promise.reject(new Error(msg));
    }
  }

  private realNotify(
    title: string,
    desc: string,
    click?: Function
  ): Notification {
    const notification = new Notification(title, { body: desc });
    if (click) {
      notification.addEventListener('click', (event) => {
        click(event);
      });
    }
    return notification;
  }
}
