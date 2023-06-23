import { NgModule } from '@angular/core';
import { MyNotifyObserverGroupRoutingModule } from './my-notify-observer-group-routing.module';
import { SharedModule } from 'src/app/shared';
import { MyNotifyObserverGroupComponent } from './my-notify-observer-group.component';
import { CreateNotifyObserverGroupModule } from 'src/app/modules/create-notify-observer-group';
import { NotifyObserverGroupItemModule } from 'src/app/modules/notify-observer-group-item';

@NgModule({
  imports: [
    SharedModule,
    MyNotifyObserverGroupRoutingModule,
    CreateNotifyObserverGroupModule,
    NotifyObserverGroupItemModule,
  ],
  declarations: [MyNotifyObserverGroupComponent],
  exports: [MyNotifyObserverGroupComponent],
})
export class MyNotifyObserverGroupModule { }
