import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AirdropInteractionRecordComponent } from './airdrop-interaction-record.component';

const routes: Routes = [{ path: '', component: AirdropInteractionRecordComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AirdropInteractionRecordRoutingModule { }
