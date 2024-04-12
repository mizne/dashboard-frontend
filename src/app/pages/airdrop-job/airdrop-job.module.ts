import { NgModule } from '@angular/core';
import { AirdropJobRoutingModule } from './airdrop-job-routing.module';
import { SharedModule } from 'src/app/shared';
import { AirdropJobComponent } from './airdrop-job.component';
import { CreateAirdropJobModule } from 'src/app/modules/create-airdrop-job';
import { FollowedProjectSelectViewModule } from 'src/app/modules/followed-project-select-view'
import { FollowedProjectSelectModule } from 'src/app/modules/followed-project-select';

@NgModule({
  imports: [
    SharedModule,
    CreateAirdropJobModule,
    AirdropJobRoutingModule,
    FollowedProjectSelectViewModule,
    FollowedProjectSelectModule,
  ],
  declarations: [AirdropJobComponent],
  exports: [AirdropJobComponent],
})
export class AirdropJobModule { }
