import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { FollowedProjectSelectViewComponent } from './followed-project-select-view.component'
import { FollowedProjectItemModule } from 'src/app/modules/followed-project-item'

@NgModule({
  imports: [SharedModule, FollowedProjectItemModule],
  exports: [FollowedProjectSelectViewComponent],
  declarations: [FollowedProjectSelectViewComponent],
  providers: [],
})
export class FollowedProjectSelectViewModule { }
