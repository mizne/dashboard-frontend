import { NgModule } from '@angular/core';
import { CexFuturePageRoutingModule } from './cex-future-page-routing.module';
import { SharedModule } from 'src/app/shared';
import { CexFuturePageComponent } from './cex-future-page.component';
import { CexFutureLongshortChartComponent } from './components/cex-future-longshort-chart/cex-future-longshort-chart.component'
import { CexFutureFundingrateChartComponent } from './components/cex-future-fundingrate-chart/cex-future-fundingrate-chart.component'
import { CexFutureDetailComponent } from './components/cex-future-detail/cex-future-detail.component'
import { NotifyHistoryModule } from 'src/app/modules/notify-history';

@NgModule({
  imports: [
    SharedModule,
    CexFuturePageRoutingModule,
    NotifyHistoryModule,
  ],
  declarations: [
    CexFuturePageComponent,
    CexFutureLongshortChartComponent,
    CexFutureFundingrateChartComponent,
    CexFutureDetailComponent,
  ],
  exports: [CexFuturePageComponent],
})
export class CexFuturePageModule { }
