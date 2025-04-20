import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexTokenListComponent } from './cex-token-list.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'
import { CexTokenItemDetailModule } from 'src/app/modules/cex-token-item-detail'
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule,
    CexTokenItemDetailModule,
    CexFutureItemDetailModule,
  ],
  exports: [CexTokenListComponent],
  declarations: [CexTokenListComponent],
  providers: [],
})
export class CexTokenListModule { }
