import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureSymbolItemComponent } from './cex-future-symbol-item.component'
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer'


@NgModule({
  imports: [
    SharedModule,
    CreateNotifyObserverModule
  ],
  exports: [CexFutureSymbolItemComponent],
  declarations: [CexFutureSymbolItemComponent],
  providers: [],
})
export class CexFutureSymbolItemModule { }
