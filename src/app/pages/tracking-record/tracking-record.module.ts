import { NgModule } from '@angular/core';
import { TrackingRecordRoutingModule } from './tracking-record-routing.module';
import { SharedModule } from 'src/app/shared';
import { TrackingRecordComponent } from './tracking-record.component';
import { CreateFollowedProjectTrackingRecordModule } from 'src/app/modules/create-followed-project-tracking-record';

@NgModule({
  imports: [
    SharedModule,
    CreateFollowedProjectTrackingRecordModule,
    TrackingRecordRoutingModule,
  ],
  declarations: [TrackingRecordComponent],
  exports: [TrackingRecordComponent],
})
export class TrackingRecordModule { }
