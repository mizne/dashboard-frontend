import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { AirdropAccountAttendJobManagerForJobComponent } from './airdrop-account-attend-job-manager-for-job.component'

import { AirdropAccountSelectViewModule } from 'src/app/modules/airdrop-account-select-view';
import { CreateAirdropAccountAttendJobModule } from 'src/app/modules/create-airdrop-account-attend-job';


@NgModule({
  imports: [
    SharedModule,
    AirdropAccountSelectViewModule,
    CreateAirdropAccountAttendJobModule,
  ],
  exports: [AirdropAccountAttendJobManagerForJobComponent],
  declarations: [AirdropAccountAttendJobManagerForJobComponent],
  providers: [],
})
export class AirdropAccountAttendJobManagerForJobModule { }
