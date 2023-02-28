import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateNotifyObserverComponent } from './components/create-notify-observer.component';
import { CreateNotifyObserverService } from './create-notify-observer.service';
import { FollowedProjectSelectModule } from 'src/app/modules/followed-project-select'

@NgModule({
  imports: [SharedModule, FollowedProjectSelectModule],
  exports: [CreateNotifyObserverComponent],
  declarations: [CreateNotifyObserverComponent],
  providers: [CreateNotifyObserverService],
})
export class CreateNotifyObserverModule { }
