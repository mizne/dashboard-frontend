import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { TimerNotifyObserverModalComponent } from './components/timer-notify-observer-modal.component'
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer'
import { CreateSystemTaskTimerSettingsModule } from 'src/app/modules/create-system-task-timer-settings'
import { TaskRecordModalModule } from 'src/app/modules/task-record-modal'

@NgModule({
  imports: [
    SharedModule,
    CreateNotifyObserverModule,
    CreateSystemTaskTimerSettingsModule,
    TaskRecordModalModule
  ],
  exports: [TimerNotifyObserverModalComponent],
  declarations: [TimerNotifyObserverModalComponent],
  providers: [],
})
export class TimerNotifyObserverModalModule { }
