import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ProjectStatisticsRoutingModule } from './project-statistics-routing.module';

import { ProjectStatisticsComponent } from './project-statistics.component';

@NgModule({
  imports: [ProjectStatisticsRoutingModule, NzButtonModule],
  declarations: [ProjectStatisticsComponent],
  exports: [ProjectStatisticsComponent],
})
export class ProjectStatisticsModule {}
