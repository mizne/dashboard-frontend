import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyHistoryItemComponent } from './notify-history-item.component'
import { FollowedProjectSelectViewModule } from 'src/app/modules/followed-project-select-view'
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer';
import { CreateNotifyObserverNotAllowModule } from 'src/app/modules/create-notify-observer-not-allow';
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail';


@NgModule({
  imports: [
    SharedModule,
    FollowedProjectSelectViewModule,
    CreateNotifyObserverModule,
    CreateNotifyObserverNotAllowModule,
    CexFutureItemDetailModule,
  ],
  exports: [NotifyHistoryItemComponent],
  declarations: [NotifyHistoryItemComponent],
  providers: [],
})
export class NotifyHistoryItemModule { }
