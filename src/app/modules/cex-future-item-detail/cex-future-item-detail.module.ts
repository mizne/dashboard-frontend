import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexFutureItemDetailComponent } from './cex-future-item-detail.component'

@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [CexFutureItemDetailComponent],
  declarations: [CexFutureItemDetailComponent],
  providers: [],
})
export class CexFutureItemDetailModule { }
