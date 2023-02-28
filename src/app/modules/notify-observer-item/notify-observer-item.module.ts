import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { NotifyObserverItemComponent } from './notify-observer-item.component'
import { FollowedProjectSelectViewModule } from 'src/app/modules/followed-project-select-view'

@NgModule({
  imports: [SharedModule, FollowedProjectSelectViewModule],
  exports: [NotifyObserverItemComponent],
  declarations: [NotifyObserverItemComponent],
  providers: [],
})
export class NotifyObserverItemModule { }
