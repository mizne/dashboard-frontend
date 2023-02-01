import { NgModule } from '@angular/core';
import { MyNotificationRoutingModule } from './my-notification-routing.module';
import { SharedModule } from 'src/app/shared';
import { MyNotificationComponent } from './my-notification.component';
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer';
import { NotifyObserverNotAllowListModule } from 'src/app/modules/notify-observer-not-allow-list';
import { TimerNotifyObserverModalModule } from 'src/app/modules/timer-notify-observer';

@NgModule({
  imports: [
    SharedModule,
    CreateNotifyObserverModule,
    MyNotificationRoutingModule,
    NotifyObserverNotAllowListModule,
    TimerNotifyObserverModalModule,
  ],
  declarations: [MyNotificationComponent],
  exports: [MyNotificationComponent],
})
export class MyNotificationModule { }
