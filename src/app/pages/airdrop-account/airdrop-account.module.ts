import { NgModule } from '@angular/core';
import { AirdropAccountRoutingModule } from './airdrop-account-routing.module';
import { SharedModule } from 'src/app/shared';
import { AirdropAccountComponent } from './airdrop-account.component';
import { components } from './components'
import { CreateAirdropAccountModule } from 'src/app/modules/create-airdrop-account';
import { AirdropAccountItemModule } from 'src/app/modules/airdrop-account-item';

import { AirdropJobSelectViewModule } from 'src/app/modules/airdrop-job-select-view';
import { CreateAirdropAccountAttendJobModule } from 'src/app/modules/create-airdrop-account-attend-job';

@NgModule({
  imports: [
    SharedModule,
    AirdropAccountRoutingModule,
    CreateAirdropAccountModule,
    AirdropAccountItemModule,

    AirdropJobSelectViewModule,
    CreateAirdropAccountAttendJobModule,
  ],
  declarations: [AirdropAccountComponent, ...components],
  exports: [AirdropAccountComponent],
})
export class AirdropAccountModule { }
