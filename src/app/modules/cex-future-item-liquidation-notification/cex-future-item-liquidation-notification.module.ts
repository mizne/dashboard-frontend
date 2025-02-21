import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureItemLiquidationNotificationComponent } from './cex-future-item-liquidation-notification.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule
  ],
  exports: [CexFutureItemLiquidationNotificationComponent],
  declarations: [CexFutureItemLiquidationNotificationComponent],
  providers: [],
})
export class CexFutureItemLiquidationNotificationModule { }
