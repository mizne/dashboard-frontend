import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateSystemTaskTimerSettingsComponent } from './components/create-system-task-timer-settings.component';
import { CreateSystemTaskTimerSettingsService } from './create-system-task-timer-settings.service';
import { FollowedProjectSelectModule } from 'src/app/modules/followed-project-select'

@NgModule({
  imports: [SharedModule, FollowedProjectSelectModule],
  exports: [CreateSystemTaskTimerSettingsComponent],
  declarations: [CreateSystemTaskTimerSettingsComponent],
  providers: [CreateSystemTaskTimerSettingsService],
})
export class CreateSystemTaskTimerSettingsModule { }
