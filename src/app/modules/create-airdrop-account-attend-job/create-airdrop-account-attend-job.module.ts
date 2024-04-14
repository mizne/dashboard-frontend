import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateAirdropAccountAttendJobComponent } from './components/create-airdrop-account-attend-job.component';
import { CreateAirdropAccountAttendJobService } from './create-airdrop-account-attend-job.service';

import { AirdropAccountSelectModule } from 'src/app/modules/airdrop-account-select'
import { AirdropJobSelectModule } from 'src/app/modules/airdrop-job-select'

@NgModule({
  imports: [SharedModule, AirdropAccountSelectModule, AirdropJobSelectModule],
  exports: [CreateAirdropAccountAttendJobComponent],
  declarations: [CreateAirdropAccountAttendJobComponent,],
  providers: [CreateAirdropAccountAttendJobService],
})
export class CreateAirdropAccountAttendJobModule { }
