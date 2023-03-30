import { NgModule } from '@angular/core';
import { CexFuturePageRoutingModule } from './cex-future-page-routing.module';
import { SharedModule } from 'src/app/shared';
import { CexFuturePageComponent } from './cex-future-page.component';

@NgModule({
  imports: [
    SharedModule,
    CexFuturePageRoutingModule,
  ],
  declarations: [CexFuturePageComponent],
  exports: [CexFuturePageComponent],
})
export class CexFuturePageModule { }
