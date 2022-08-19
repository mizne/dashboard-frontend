import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectStatisticsComponent } from './project-statistics.component';
import { ProjectListComponent } from './components/list/project-list.component';
import { ProjectDetailComponent } from './components/detail/project-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ProjectListComponent },
  { path: 'detail/:id', component: ProjectDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectStatisticsRoutingModule {}
