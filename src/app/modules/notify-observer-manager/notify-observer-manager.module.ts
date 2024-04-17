import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyObserverManagerComponent } from './notify-observer-manager.component'

import { NotifyObserverItemModule } from 'src/app/modules/notify-observer-item';
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer';


@NgModule({
  imports: [
    SharedModule,
    NotifyObserverItemModule,
    CreateNotifyObserverModule,
  ],
  exports: [NotifyObserverManagerComponent],
  declarations: [NotifyObserverManagerComponent],
  providers: [],
})
export class NotifyObserverManagerModule { }
