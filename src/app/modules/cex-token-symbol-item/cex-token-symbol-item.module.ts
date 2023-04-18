import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexTokenSymbolItemComponent } from './cex-token-symbol-item.component'


@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [CexTokenSymbolItemComponent],
  declarations: [CexTokenSymbolItemComponent],
  providers: [],
})
export class CexTokenSymbolItemModule { }
