import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CexTokenItemDetailComponent } from './cex-token-item-detail.component'

@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [CexTokenItemDetailComponent],
  declarations: [CexTokenItemDetailComponent],
  providers: [],
})
export class CexTokenItemDetailModule { }
