import { NgModule } from '@angular/core';
import { AirdropAccountRoutingModule } from './airdrop-account-routing.module';
import { SharedModule } from 'src/app/shared';
import { AirdropAccountComponent } from './airdrop-account.component';
import { components } from './components'
import { CreateAirdropAccountModule } from 'src/app/modules/create-airdrop-account';
import { AirdropAccountItemModule } from 'src/app/modules/airdrop-account-item';

@NgModule({
  imports: [
    SharedModule,
    AirdropAccountRoutingModule,
    CreateAirdropAccountModule,
    AirdropAccountItemModule,
  ],
  declarations: [AirdropAccountComponent, ...components],
  exports: [AirdropAccountComponent],
})
export class AirdropAccountModule { }
