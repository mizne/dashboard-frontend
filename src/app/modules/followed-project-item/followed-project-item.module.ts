import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { FollowedProjectItemComponent } from './followed-project-item.component'
import { FollowedProjectMoreModule } from 'src/app/modules/followed-project-more';

@NgModule({
  imports: [SharedModule, FollowedProjectMoreModule],
  exports: [FollowedProjectItemComponent],
  declarations: [FollowedProjectItemComponent],
  providers: [],
})
export class FollowedProjectItemModule { }
