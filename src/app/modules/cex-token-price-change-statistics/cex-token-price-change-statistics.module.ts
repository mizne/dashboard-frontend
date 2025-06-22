import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexTokenPriceChangeStatisticsComponent } from './cex-token-price-change-statistics.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'
import { CexFutureSymbolItemModule } from 'src/app/modules/cex-future-symbol-item'
import { CexTokenItemDetailModule } from 'src/app/modules/cex-token-item-detail'
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail'

import { components, CustomDateRangeComponent } from './components/index'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule,
    CexFutureSymbolItemModule,
    CexTokenItemDetailModule,
    CexFutureItemDetailModule
  ],
  exports: [CexTokenPriceChangeStatisticsComponent, CustomDateRangeComponent],
  declarations: [CexTokenPriceChangeStatisticsComponent, ...components],
  providers: [],
})
export class CexTokenPriceChangeStatisticsModule { }
