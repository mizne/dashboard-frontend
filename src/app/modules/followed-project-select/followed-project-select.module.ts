import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { FollowedProjectSelectComponent } from './followed-project-select.component'

@NgModule({
  imports: [SharedModule],
  exports: [FollowedProjectSelectComponent],
  declarations: [FollowedProjectSelectComponent],
  providers: [],
})
export class FollowedProjectSelectModule { }
