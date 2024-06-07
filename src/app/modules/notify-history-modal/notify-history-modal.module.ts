import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyHistoryModalComponent } from './notify-history-modal.component'
import { NotifyHistoryItemModule } from 'src/app/modules/notify-history-item'

@NgModule({
  imports: [
    SharedModule,
    NotifyHistoryItemModule
  ],
  exports: [NotifyHistoryModalComponent],
  declarations: [NotifyHistoryModalComponent],
  providers: [],
})
export class NotifyHistoryModalModule { }
