import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { MyNotificationRoutingModule } from './my-notification-routing.module';

import { MyNotificationComponent } from './my-notification.component';

@NgModule({
  imports: [MyNotificationRoutingModule, NzButtonModule],
  declarations: [MyNotificationComponent],
  exports: [MyNotificationComponent],
})
export class MyNotificationModule {}
