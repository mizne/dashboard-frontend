import { NgModule } from '@angular/core';
import { CexFuturePageRoutingModule } from './cex-future-page-routing.module';
import { SharedModule } from 'src/app/shared';
import { CexFuturePageComponent } from './cex-future-page.component';
import { CexFutureLongshortChartComponent } from './components/cex-future-longshort-chart/cex-future-longshort-chart.component'
import { CexFutureFundingrateChartComponent } from './components/cex-future-fundingrate-chart/cex-future-fundingrate-chart.component'
import { CexFutureOpeninterestChartComponent } from './components/cex-future-openinterest-chart/cex-future-openinterest-chart.component'
import { CexFutureDetailComponent } from './components/cex-future-detail/cex-future-detail.component'
import { NotifyHistoryModule } from 'src/app/modules/notify-history';
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item';

@NgModule({
  imports: [
    SharedModule,
    CexFuturePageRoutingModule,
    NotifyHistoryModule,
    CexTokenSymbolItemModule,
  ],
  declarations: [
    CexFuturePageComponent,
    CexFutureLongshortChartComponent,
    CexFutureFundingrateChartComponent,
    CexFutureOpeninterestChartComponent,
    CexFutureDetailComponent,
  ],
  exports: [CexFuturePageComponent],
})
export class CexFuturePageModule { }
