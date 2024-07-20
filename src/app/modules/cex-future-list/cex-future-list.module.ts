import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureListComponent } from './cex-future-list.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule,
    CexFutureItemDetailModule
  ],
  exports: [CexFutureListComponent],
  declarations: [CexFutureListComponent],
  providers: [],
})
export class CexFutureListModule { }
