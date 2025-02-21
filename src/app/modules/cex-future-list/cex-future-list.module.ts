import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureListComponent } from './cex-future-list.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail'
import { CexFutureItemLiquidationNotificationModule } from 'src/app/modules/cex-future-item-liquidation-notification'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule,
    CexFutureItemDetailModule,
    CexFutureItemLiquidationNotificationModule,
  ],
  exports: [CexFutureListComponent],
  declarations: [CexFutureListComponent],
  providers: [],
})
export class CexFutureListModule { }
