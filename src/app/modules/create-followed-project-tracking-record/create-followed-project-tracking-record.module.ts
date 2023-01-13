import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateFollowedProjectTrackingRecordComponent } from './components/create-followed-project-tracking-record.component';
import { CreateFollowedProjectTrackingRecordService } from './create-followed-project-tracking-record.service';
@NgModule({
  imports: [SharedModule],
  exports: [CreateFollowedProjectTrackingRecordComponent],
  declarations: [CreateFollowedProjectTrackingRecordComponent],
  providers: [CreateFollowedProjectTrackingRecordService],
})
export class CreateFollowedProjectTrackingRecordModule { }
