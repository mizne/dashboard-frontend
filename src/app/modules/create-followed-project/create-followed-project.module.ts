import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateFollowedProjectComponent } from './components/create-followed-project.component';
import { CreateFollowedProjectService } from './create-followed-project.service';
@NgModule({
  imports: [SharedModule],
  exports: [CreateFollowedProjectComponent],
  declarations: [CreateFollowedProjectComponent],
  providers: [CreateFollowedProjectService],
})
export class CreateFollowedProjectModule { }
