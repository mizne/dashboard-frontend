import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyObserverItemModule } from 'src/app/modules/notify-observer-item';
import { NotifyObserverGroupItemComponent } from './notify-observer-group-item.component'
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer';

@NgModule({
  imports: [
    SharedModule,
    CreateNotifyObserverModule,
    NotifyObserverItemModule
  ],
  exports: [NotifyObserverGroupItemComponent],
  declarations: [NotifyObserverGroupItemComponent],
  providers: [],
})
export class NotifyObserverGroupItemModule { }
