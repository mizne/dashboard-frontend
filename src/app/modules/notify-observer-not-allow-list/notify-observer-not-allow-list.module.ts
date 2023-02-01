import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyObserverNotAllowListComponent } from './components/notify-observer-not-allow-list/notify-observer-not-allow-list.component';
import { NotifyObserverNotAllowListModalComponent } from './components/notify-observer-not-allow-list-modal/notify-observer-not-allow-list-modal.component';
import { CreateNotifyObserverNotAllowModule } from 'src/app/modules/create-notify-observer-not-allow';

@NgModule({
  imports: [SharedModule, CreateNotifyObserverNotAllowModule],
  exports: [NotifyObserverNotAllowListComponent, NotifyObserverNotAllowListModalComponent],
  declarations: [NotifyObserverNotAllowListComponent, NotifyObserverNotAllowListModalComponent],
  providers: [],
})
export class NotifyObserverNotAllowListModule { }
