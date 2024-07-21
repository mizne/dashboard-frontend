import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexTokenSymbolItemComponent } from './cex-token-symbol-item.component'
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer'


@NgModule({
  imports: [
    SharedModule,
    CreateNotifyObserverModule
  ],
  exports: [CexTokenSymbolItemComponent],
  declarations: [CexTokenSymbolItemComponent],
  providers: [],
})
export class CexTokenSymbolItemModule { }
