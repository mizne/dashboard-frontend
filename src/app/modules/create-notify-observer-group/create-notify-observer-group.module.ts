import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateNotifyObserverGroupComponent } from './components/create-notify-observer-group.component';
import { CreateNotifyObserverGroupService } from './create-notify-observer-group.service';
import { NotifyObserverMultiSelectModule } from 'src/app/modules/notify-observer-multi-select'

@NgModule({
  imports: [SharedModule, NotifyObserverMultiSelectModule],
  exports: [CreateNotifyObserverGroupComponent],
  declarations: [CreateNotifyObserverGroupComponent],
  providers: [CreateNotifyObserverGroupService],
})
export class CreateNotifyObserverGroupModule { }
