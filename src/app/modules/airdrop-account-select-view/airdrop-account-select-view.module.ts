import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { AirdropAccountSelectViewComponent } from './airdrop-account-select-view.component'

@NgModule({
  imports: [SharedModule],
  exports: [AirdropAccountSelectViewComponent],
  declarations: [AirdropAccountSelectViewComponent],
  providers: [],
})
export class AirdropAccountSelectViewModule { }
