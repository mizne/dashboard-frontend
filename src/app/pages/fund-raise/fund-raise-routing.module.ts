import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FundRaiseComponent } from './fund-raise.component';

const routes: Routes = [{ path: '', component: FundRaiseComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FundRaiseRoutingModule {}
