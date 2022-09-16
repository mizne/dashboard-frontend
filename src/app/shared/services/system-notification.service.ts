import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SystemNotificationService {
  constructor() {}

  notify(title: string, desc: string) {
    return new Notification(title, { body: desc });
  }
}
