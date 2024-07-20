import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexTokenListComponent } from './cex-token-list.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'
import { CexTokenItemDetailModule } from 'src/app/modules/cex-token-item-detail'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule,
    CexTokenItemDetailModule
  ],
  exports: [CexTokenListComponent],
  declarations: [CexTokenListComponent],
  providers: [],
})
export class CexTokenListModule { }
