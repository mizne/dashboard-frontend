import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { TimerNotifyObserverModalComponent } from './components/timer-notify-observer-modal.component'

@NgModule({
  imports: [SharedModule],
  exports: [TimerNotifyObserverModalComponent],
  declarations: [TimerNotifyObserverModalComponent],
  providers: [],
})
export class TimerNotifyObserverModalModule { }
