import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { FollowedProjectMoreComponent } from './followed-project-more.component'
import { CreateFollowedProjectTrackingRecordModule } from 'src/app/modules/create-followed-project-tracking-record';
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer';

@NgModule({
  imports: [SharedModule, CreateNotifyObserverModule, CreateFollowedProjectTrackingRecordModule],
  exports: [FollowedProjectMoreComponent],
  declarations: [FollowedProjectMoreComponent],
  providers: [],
})
export class FollowedProjectMoreModule { }
