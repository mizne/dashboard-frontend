import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureItemDetailComponent } from './cex-future-item-detail.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule
  ],
  exports: [CexFutureItemDetailComponent],
  declarations: [CexFutureItemDetailComponent],
  providers: [],
})
export class CexFutureItemDetailModule { }
