import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CexTokenPageComponent } from './cex-token-page.component';

const routes: Routes = [{ path: '', component: CexTokenPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CexTokenPageRoutingModule { }
