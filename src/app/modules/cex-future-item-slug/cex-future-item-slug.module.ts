import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureItemSlugComponent } from './cex-future-item-slug.component'
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item'

@NgModule({
  imports: [
    SharedModule,
    CexTokenSymbolItemModule
  ],
  exports: [CexFutureItemSlugComponent],
  declarations: [CexFutureItemSlugComponent],
  providers: [],
})
export class CexFutureItemSlugModule { }
