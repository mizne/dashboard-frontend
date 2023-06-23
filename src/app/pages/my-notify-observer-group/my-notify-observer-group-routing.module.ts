import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyNotifyObserverGroupComponent } from './my-notify-observer-group.component';

const routes: Routes = [{ path: '', component: MyNotifyObserverGroupComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyNotifyObserverGroupRoutingModule { }
