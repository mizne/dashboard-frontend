import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateNotifyObserverGroupComponent } from './components/create-notify-observer-group.component';
import { CreateNotifyObserverGroupService } from './create-notify-observer-group.service';
import { FollowedProjectSelectModule } from 'src/app/modules/followed-project-select'

@NgModule({
  imports: [SharedModule, FollowedProjectSelectModule],
  exports: [CreateNotifyObserverGroupComponent],
  declarations: [CreateNotifyObserverGroupComponent],
  providers: [CreateNotifyObserverGroupService],
})
export class CreateNotifyObserverGroupModule { }
