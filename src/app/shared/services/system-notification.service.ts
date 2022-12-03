import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

interface NotifyOptions {
  title: string;
  desc: string;
  click?: Function;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class SystemNotificationService {
  constructor(private readonly nzNotificationService: NzNotificationService) { }

  success(options: NotifyOptions): Promise<Notification> {
    return this.checkPermission().then(() => {
      return this.realNotify(options, '/assets/success.png');
    });
  }

  error(options: NotifyOptions): Promise<Notification> {
    return this.checkPermission().then(() => {
      return this.realNotify(options, '/assets/error.png');
    });
  }

  warning(options: NotifyOptions): Promise<Notification> {
    return this.checkPermission().then(() => {
      return this.realNotify(options, '/assets/warning.png');
    });
  }

  info(options: NotifyOptions): Promise<Notification> {
    return this.checkPermission().then(() => {
      return this.realNotify(options, '/assets/info.png');
    });
  }

  notify(options: NotifyOptions): Promise<Notification> {
    return this.checkPermission().then(() => {
      return this.realNotify(options);
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

  private realNotify(options: NotifyOptions, icon?: string): Notification {
    const notification = new Notification(options.title, {
      body: options.desc,
      ...((options.icon || icon) ? { icon: options.icon || icon } : {}),
    });
    if (options.click) {
      notification.addEventListener('click', (event) => {
        (options.click as Function)(event);
      });
    }
    return notification;
  }
}
