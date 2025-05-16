import { NgModule } from '@angular/core';
import { CexFuturePageRoutingModule } from './cex-future-page-routing.module';
import { SharedModule } from 'src/app/shared';
import { CexFuturePageComponent } from './cex-future-page.component';
import { CexFutureLongshortChartComponent } from './components/cex-future-longshort-chart/cex-future-longshort-chart.component'
import { CexFutureFundingrateChartComponent } from './components/cex-future-fundingrate-chart/cex-future-fundingrate-chart.component'
import { CexFutureOpeninterestChartComponent } from './components/cex-future-openinterest-chart/cex-future-openinterest-chart.component'
import { CexFuturePriceChartComponent } from './components/cex-future-price-chart/cex-future-price-chart.component'
import { NotifyHistoryModule } from 'src/app/modules/notify-history';
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item';
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail';
import { CexFutureItemSlugModule } from 'src/app/modules/cex-future-item-slug'

@NgModule({
  imports: [
    SharedModule,
    CexFuturePageRoutingModule,
    NotifyHistoryModule,
    CexTokenSymbolItemModule,
    CexFutureItemDetailModule,
    CexFutureItemSlugModule,
  ],
  declarations: [
    CexFuturePageComponent,
    CexFutureLongshortChartComponent,
    CexFutureFundingrateChartComponent,
    CexFutureOpeninterestChartComponent,
    CexFuturePriceChartComponent,
  ],
  exports: [CexFuturePageComponent],
})
export class CexFuturePageModule { }
