import { NgModule } from '@angular/core';
import { AirdropAccountRoutingModule } from './airdrop-account-routing.module';
import { SharedModule } from 'src/app/shared';
import { AirdropAccountComponent } from './airdrop-account.component';
import { components } from './components'
import { CreateAirdropAccountModule } from 'src/app/modules/create-airdrop-account';
import { AirdropAccountItemModule } from 'src/app/modules/airdrop-account-item';

import { AirdropAccountAttendJobManagerForAccountModule } from 'src/app/modules/airdrop-account-attend-job-manager-for-account';

@NgModule({
  imports: [
    SharedModule,
    AirdropAccountRoutingModule,
    CreateAirdropAccountModule,
    AirdropAccountItemModule,

    AirdropAccountAttendJobManagerForAccountModule,
  ],
  declarations: [AirdropAccountComponent, ...components],
  exports: [AirdropAccountComponent],
})
export class AirdropAccountModule { }
