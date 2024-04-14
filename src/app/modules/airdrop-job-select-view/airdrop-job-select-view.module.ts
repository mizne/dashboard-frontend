import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { AirdropJobSelectViewComponent } from './airdrop-job-select-view.component'

@NgModule({
  imports: [SharedModule],
  exports: [AirdropJobSelectViewComponent],
  declarations: [AirdropJobSelectViewComponent],
  providers: [],
})
export class AirdropJobSelectViewModule { }
