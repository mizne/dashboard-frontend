import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FollowedProjectComponent } from './followed-project.component';
import { FollowedProjectDetailComponent } from './components'

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: FollowedProjectComponent },
  { path: 'detail/:id', component: FollowedProjectDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FollowedProjectRoutingModule { }
