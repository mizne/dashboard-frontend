import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { TaskRecordModalComponent } from './components/task-record-modal.component'

@NgModule({
  imports: [SharedModule],
  exports: [TaskRecordModalComponent],
  declarations: [TaskRecordModalComponent],
  providers: [],
})
export class TaskRecordModalModule { }
