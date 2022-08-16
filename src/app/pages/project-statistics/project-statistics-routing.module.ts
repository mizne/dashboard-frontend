import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectStatisticsComponent } from './project-statistics.component';

const routes: Routes = [{ path: '', component: ProjectStatisticsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectStatisticsRoutingModule {}
