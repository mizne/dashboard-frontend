import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CexFuturePageComponent } from './cex-future-page.component';

const routes: Routes = [{ path: '', component: CexFuturePageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CexFuturePageRoutingModule { }
