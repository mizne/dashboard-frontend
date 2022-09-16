import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SystemNotificationService {
  constructor() {}

  notify(title: string, desc: string, click?: Function): Promise<Notification> {
    return this.checkPermission().then(() => {
      return this.realNotify(title, desc, click);
    });
  }

  private checkPermission(): Promise<void> {
    if (!('Notification' in window)) {
      return Promise.reject(
        new Error('This browser does not support desktop notification')
      );
    } else if (Notification.permission === 'granted') {
      return Promise.resolve();
    } else if (Notification.permission !== 'denied') {
      return Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error(`user denied permission`));
        }
      });
    } else {
      return Promise.reject(new Error(`user denied permission`));
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
