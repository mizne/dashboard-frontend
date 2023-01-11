import { NgModule } from '@angular/core';
import { FollowedProjectRoutingModule } from './followed-project-routing.module';
import { SharedModule } from 'src/app/shared';
import { FollowedProjectComponent } from './followed-project.component';
import { CreateFollowedProjectModule } from 'src/app/modules/create-followed-project';

@NgModule({
  imports: [
    SharedModule,
    CreateFollowedProjectModule,
    FollowedProjectRoutingModule,
  ],
  declarations: [FollowedProjectComponent],
  exports: [FollowedProjectComponent],
})
export class FollowedProjectModule { }
