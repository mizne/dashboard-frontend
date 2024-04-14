import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { AirdropJobSelectComponent } from './airdrop-job-select.component'

@NgModule({
  imports: [SharedModule],
  exports: [AirdropJobSelectComponent],
  declarations: [AirdropJobSelectComponent],
  providers: [],
})
export class AirdropJobSelectModule { }
