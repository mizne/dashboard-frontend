import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureItemSlugComponent } from './cex-future-item-slug.component'
import { CexFutureSymbolItemModule } from 'src/app/modules/cex-future-symbol-item'

@NgModule({
  imports: [
    SharedModule,
    CexFutureSymbolItemModule
  ],
  exports: [CexFutureItemSlugComponent],
  declarations: [CexFutureItemSlugComponent],
  providers: [],
})
export class CexFutureItemSlugModule { }
