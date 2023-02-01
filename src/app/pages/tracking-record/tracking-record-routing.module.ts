import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrackingRecordComponent } from './tracking-record.component';

const routes: Routes = [{ path: '', component: TrackingRecordComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrackingRecordRoutingModule { }
