import { NgModule } from '@angular/core';
import { ProjectStatisticsRoutingModule } from './project-statistics-routing.module';

import { ProjectStatisticsComponent } from './project-statistics.component';
import { components } from './components';
import { SharedModule } from 'src/app/shared';
import { CreateProjectModule } from 'src/app/modules/create-project';

@NgModule({
  imports: [SharedModule, CreateProjectModule, ProjectStatisticsRoutingModule],
  declarations: [ProjectStatisticsComponent, ...components],
  exports: [ProjectStatisticsComponent],
})
export class ProjectStatisticsModule {}
