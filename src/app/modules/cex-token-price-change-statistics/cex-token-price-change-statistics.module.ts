import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexTokenPriceChangeStatisticsComponent } from './cex-token-price-change-statistics.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'
import { CexTokenItemDetailModule } from 'src/app/modules/cex-token-item-detail'
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule,
    CexTokenItemDetailModule,
    CexFutureItemDetailModule
  ],
  exports: [CexTokenPriceChangeStatisticsComponent],
  declarations: [CexTokenPriceChangeStatisticsComponent],
  providers: [],
})
export class CexTokenPriceChangeStatisticsModule { }
