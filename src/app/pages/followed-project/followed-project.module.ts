import { NgModule } from '@angular/core';
import { FollowedProjectRoutingModule } from './followed-project-routing.module';
import { SharedModule } from 'src/app/shared';
import { FollowedProjectComponent } from './followed-project.component';
import { components } from './components'
import { CreateFollowedProjectModule } from 'src/app/modules/create-followed-project';
import { CreateFollowedProjectTrackingRecordModule } from 'src/app/modules/create-followed-project-tracking-record';
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer';
import { NotifyHistoryModule } from 'src/app/modules/notify-history';

@NgModule({
  imports: [
    SharedModule,
    CreateFollowedProjectModule,
    FollowedProjectRoutingModule,
    CreateNotifyObserverModule,
    CreateFollowedProjectTrackingRecordModule,
    NotifyHistoryModule,
  ],
  declarations: [FollowedProjectComponent, ...components],
  exports: [FollowedProjectComponent],
})
export class FollowedProjectModule { }
