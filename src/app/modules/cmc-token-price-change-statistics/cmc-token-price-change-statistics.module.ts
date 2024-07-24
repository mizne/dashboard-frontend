import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CMCTokenPriceChangeStatisticsComponent } from './cmc-token-price-change-statistics.component'

import { components } from './components/index'

@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [CMCTokenPriceChangeStatisticsComponent],
  declarations: [CMCTokenPriceChangeStatisticsComponent, ...components],
  providers: [],
})
export class CMCTokenPriceChangeStatisticsModule { }
