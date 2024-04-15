import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { AirdropAccountItemComponent } from './airdrop-account-item.component'
import { AirdropAccountAttendJobManagerForAccountModule } from 'src/app/modules/airdrop-account-attend-job-manager-for-account';
import { AirdropInteractionRecordManagerModule } from 'src/app/modules/airdrop-interaction-record-manager';

@NgModule({
  imports: [
    SharedModule,
    AirdropAccountAttendJobManagerForAccountModule,
    AirdropInteractionRecordManagerModule,
  ],
  exports: [AirdropAccountItemComponent],
  declarations: [AirdropAccountItemComponent],
  providers: [],
})
export class AirdropAccountItemModule { }
