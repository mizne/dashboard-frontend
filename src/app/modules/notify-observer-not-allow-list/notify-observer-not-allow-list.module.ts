import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyObserverNotAllowListComponent } from './components/notify-observer-not-allow-list.component';
import { CreateNotifyObserverNotAllowModule } from 'src/app/modules/create-notify-observer-not-allow';

@NgModule({
  imports: [SharedModule, CreateNotifyObserverNotAllowModule],
  exports: [NotifyObserverNotAllowListComponent],
  declarations: [NotifyObserverNotAllowListComponent],
  providers: [],
})
export class NotifyObserverNotAllowListModule { }
