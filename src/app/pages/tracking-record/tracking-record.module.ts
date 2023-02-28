import { NgModule } from '@angular/core';
import { TrackingRecordRoutingModule } from './tracking-record-routing.module';
import { SharedModule } from 'src/app/shared';
import { TrackingRecordComponent } from './tracking-record.component';
import { CreateFollowedProjectTrackingRecordModule } from 'src/app/modules/create-followed-project-tracking-record';
import { FollowedProjectSelectViewModule } from 'src/app/modules/followed-project-select-view'

@NgModule({
  imports: [
    SharedModule,
    CreateFollowedProjectTrackingRecordModule,
    TrackingRecordRoutingModule,
    FollowedProjectSelectViewModule,
  ],
  declarations: [TrackingRecordComponent],
  exports: [TrackingRecordComponent],
})
export class TrackingRecordModule { }
