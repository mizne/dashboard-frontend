import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureListComponent } from './cex-future-list.component'
import { CexFutureSymbolItemModule } from 'src/app/modules/cex-future-symbol-item'
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail'
import { CexFutureItemLiquidationNotificationModule } from 'src/app/modules/cex-future-item-liquidation-notification'
import { CexFutureItemSlugModule } from 'src/app/modules/cex-future-item-slug'

@NgModule({
  imports: [
    SharedModule,
    CexFutureSymbolItemModule,
    CexFutureItemDetailModule,
    CexFutureItemLiquidationNotificationModule,
    CexFutureItemSlugModule,
  ],
  exports: [CexFutureListComponent],
  declarations: [CexFutureListComponent],
  providers: [],
})
export class CexFutureListModule { }
