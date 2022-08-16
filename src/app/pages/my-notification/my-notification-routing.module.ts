import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyNotificationComponent } from './my-notification.component';

const routes: Routes = [{ path: '', component: MyNotificationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyNotificationRoutingModule {}
