import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FollowedProjectComponent } from './followed-project.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: FollowedProjectComponent },
  // { path: 'detail/:id', component: FollowedProjectDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FollowedProjectRoutingModule { }
