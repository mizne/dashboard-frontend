import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyHistoryListComponent } from './components/notify-history-list/notify-history-list.component'
import { NotifyHistoryDrawerComponent } from './components/notify-history-drawer/notify-history-drawer.component'
import { NotifyHistoryItemModule } from 'src/app/modules/notify-history-item';

@NgModule({
  imports: [SharedModule, NotifyHistoryItemModule],
  exports: [NotifyHistoryListComponent, NotifyHistoryDrawerComponent],
  declarations: [NotifyHistoryListComponent, NotifyHistoryDrawerComponent],
  providers: [],
})
export class NotifyHistoryModule { }
