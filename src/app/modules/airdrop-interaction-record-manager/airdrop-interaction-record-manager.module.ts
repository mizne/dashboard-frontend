import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { AirdropInteractionRecordManagerComponent } from './airdrop-interaction-record-manager.component'

import { AirdropAccountSelectViewModule } from 'src/app/modules/airdrop-account-select-view';
import { AirdropJobSelectViewModule } from 'src/app/modules/airdrop-job-select-view';
import { AirdropAccountSelectModule } from 'src/app/modules/airdrop-account-select';
import { AirdropJobSelectModule } from 'src/app/modules/airdrop-job-select';
import { CreateAirdropInteractionRecordModule } from 'src/app/modules/create-airdrop-interaction-record';


@NgModule({
  imports: [
    SharedModule,
    AirdropAccountSelectViewModule,
    AirdropJobSelectViewModule,
    AirdropAccountSelectModule,
    AirdropJobSelectModule,
    CreateAirdropInteractionRecordModule,
  ],
  exports: [AirdropInteractionRecordManagerComponent],
  declarations: [AirdropInteractionRecordManagerComponent],
  providers: [],
})
export class AirdropInteractionRecordManagerModule { }
