import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyHistoryItemComponent } from './notify-history-item.component'
import { FollowedProjectSelectViewModule } from 'src/app/modules/followed-project-select-view'

@NgModule({
  imports: [SharedModule, FollowedProjectSelectViewModule],
  exports: [NotifyHistoryItemComponent],
  declarations: [NotifyHistoryItemComponent],
  providers: [],
})
export class NotifyHistoryItemModule { }
