import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureItemLiquidationNotificationComponent } from './cex-future-item-liquidation-notification.component'
import { CexFutureSymbolItemModule } from 'src/app/modules/cex-future-symbol-item'

@NgModule({
  imports: [
    SharedModule,
    CexFutureSymbolItemModule
  ],
  exports: [CexFutureItemLiquidationNotificationComponent],
  declarations: [CexFutureItemLiquidationNotificationComponent],
  providers: [],
})
export class CexFutureItemLiquidationNotificationModule { }
