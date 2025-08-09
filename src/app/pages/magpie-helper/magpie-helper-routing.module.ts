import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MagpieHelperComponent } from './magpie-helper.component';

const routes: Routes = [{ path: '', component: MagpieHelperComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MagpieHelperRoutingModule { }
