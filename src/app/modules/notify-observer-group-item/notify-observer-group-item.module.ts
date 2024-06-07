import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyObserverItemModule } from 'src/app/modules/notify-observer-item';
import { NotifyObserverGroupItemComponent } from './notify-observer-group-item.component'
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer';
import { NotifyHistoryModalModule } from 'src/app/modules/notify-history-modal'

@NgModule({
  imports: [
    SharedModule,
    CreateNotifyObserverModule,
    NotifyObserverItemModule,
    NotifyHistoryModalModule
  ],
  exports: [NotifyObserverGroupItemComponent],
  declarations: [NotifyObserverGroupItemComponent],
  providers: [],
})
export class NotifyObserverGroupItemModule { }
