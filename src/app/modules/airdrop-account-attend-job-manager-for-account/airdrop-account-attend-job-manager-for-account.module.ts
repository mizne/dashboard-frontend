import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { AirdropAccountAttendJobManagerForAccountComponent } from './airdrop-account-attend-job-manager-for-account.component'

import { AirdropJobSelectViewModule } from 'src/app/modules/airdrop-job-select-view';
import { CreateAirdropAccountAttendJobModule } from 'src/app/modules/create-airdrop-account-attend-job';


@NgModule({
  imports: [
    SharedModule,
    AirdropJobSelectViewModule,
    CreateAirdropAccountAttendJobModule,
  ],
  exports: [AirdropAccountAttendJobManagerForAccountComponent],
  declarations: [AirdropAccountAttendJobManagerForAccountComponent],
  providers: [],
})
export class AirdropAccountAttendJobManagerForAccountModule { }
