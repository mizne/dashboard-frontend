import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyObserverItemComponent } from './notify-observer-item.component'
import { FollowedProjectSelectViewModule } from 'src/app/modules/followed-project-select-view'
import { NotifyHistoryItemModule } from 'src/app/modules/notify-history-item';

@NgModule({
  imports: [
    SharedModule,
    FollowedProjectSelectViewModule,
    NotifyHistoryItemModule
  ],
  exports: [NotifyObserverItemComponent],
  declarations: [NotifyObserverItemComponent],
  providers: [],
})
export class NotifyObserverItemModule { }
