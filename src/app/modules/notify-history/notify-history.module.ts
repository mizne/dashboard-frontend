import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyHistoryListComponent } from './components/notify-history-list/notify-history-list.component'
import { NotifyHistoryDrawerComponent } from './components/notify-history-drawer/notify-history-drawer.component'
import { CreateNotifyObserverNotAllowModule } from 'src/app/modules/create-notify-observer-not-allow';
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer';

@NgModule({
  imports: [SharedModule, CreateNotifyObserverNotAllowModule, CreateNotifyObserverModule],
  exports: [NotifyHistoryListComponent, NotifyHistoryDrawerComponent],
  declarations: [NotifyHistoryListComponent, NotifyHistoryDrawerComponent],
  providers: [],
})
export class NotifyHistoryModule { }
