import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AirdropJobComponent } from './airdrop-job.component';

const routes: Routes = [{ path: '', component: AirdropJobComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AirdropJobRoutingModule { }
