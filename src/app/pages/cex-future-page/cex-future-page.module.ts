import { NgModule } from '@angular/core';
import { CexFuturePageRoutingModule } from './cex-future-page-routing.module';
import { SharedModule } from 'src/app/shared';
import { CexFuturePageComponent } from './cex-future-page.component';
import { NotifyHistoryModule } from 'src/app/modules/notify-history';

@NgModule({
  imports: [
    SharedModule,
    CexFuturePageRoutingModule,
    NotifyHistoryModule,
  ],
  declarations: [CexFuturePageComponent],
  exports: [CexFuturePageComponent],
})
export class CexFuturePageModule { }
