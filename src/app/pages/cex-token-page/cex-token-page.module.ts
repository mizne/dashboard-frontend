import { NgModule } from '@angular/core';
import { CexTokenPageRoutingModule } from './cex-token-page-routing.module';
import { SharedModule } from 'src/app/shared';
import { CexTokenPageComponent } from './cex-token-page.component';
import { CexTokenPriceStatusChartComponent } from './components/cex-token-price-status-chart/cex-token-price-status-chart.component'
import { CexTokenBigVolumeChartComponent } from './components/cex-token-big-volume-chart/cex-token-big-volume-chart.component'
import { NotifyHistoryModule } from 'src/app/modules/notify-history';

@NgModule({
  imports: [
    SharedModule,
    CexTokenPageRoutingModule,
    NotifyHistoryModule,
  ],
  declarations: [
    CexTokenPageComponent,
    CexTokenPriceStatusChartComponent,
    CexTokenBigVolumeChartComponent
  ],
  exports: [CexTokenPageComponent],
})
export class CexTokenPageModule { }
