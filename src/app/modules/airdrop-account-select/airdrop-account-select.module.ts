import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { AirdropAccountSelectComponent } from './airdrop-account-select.component'

@NgModule({
  imports: [SharedModule],
  exports: [AirdropAccountSelectComponent],
  declarations: [AirdropAccountSelectComponent],
  providers: [],
})
export class AirdropAccountSelectModule { }
