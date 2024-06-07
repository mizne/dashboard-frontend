import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexTokenItemDetailComponent } from './cex-token-item-detail.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule
  ],
  exports: [CexTokenItemDetailComponent],
  declarations: [CexTokenItemDetailComponent],
  providers: [],
})
export class CexTokenItemDetailModule { }
