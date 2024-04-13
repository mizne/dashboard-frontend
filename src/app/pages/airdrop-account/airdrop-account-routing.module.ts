import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AirdropAccountComponent } from './airdrop-account.component';
import { AirdropAccountDetailComponent } from './components'

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: AirdropAccountComponent },
  { path: 'detail/:id', component: AirdropAccountDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AirdropAccountRoutingModule { }
