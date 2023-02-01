import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { TimerNotifyObserverModalComponent } from './components/timer-notify-observer-modal.component'
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer'

@NgModule({
  imports: [SharedModule, CreateNotifyObserverModule],
  exports: [TimerNotifyObserverModalComponent],
  declarations: [TimerNotifyObserverModalComponent],
  providers: [],
})
export class TimerNotifyObserverModalModule { }
