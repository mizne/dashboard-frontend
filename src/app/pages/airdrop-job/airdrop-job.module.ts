import { NgModule } from '@angular/core';
import { AirdropJobRoutingModule } from './airdrop-job-routing.module';
import { SharedModule } from 'src/app/shared';
import { AirdropJobComponent } from './airdrop-job.component';
import { CreateAirdropJobModule } from 'src/app/modules/create-airdrop-job';
import { FollowedProjectSelectViewModule } from 'src/app/modules/followed-project-select-view'
import { FollowedProjectSelectModule } from 'src/app/modules/followed-project-select';

import { AirdropAccountAttendJobManagerForJobModule } from 'src/app/modules/airdrop-account-attend-job-manager-for-job';
import { AirdropInteractionRecordManagerModule } from 'src/app/modules/airdrop-interaction-record-manager';


@NgModule({
  imports: [
    SharedModule,
    CreateAirdropJobModule,
    AirdropJobRoutingModule,
    FollowedProjectSelectViewModule,
    FollowedProjectSelectModule,

    AirdropAccountAttendJobManagerForJobModule,
    AirdropInteractionRecordManagerModule,
  ],
  declarations: [AirdropJobComponent],
  exports: [AirdropJobComponent],
})
export class AirdropJobModule { }
