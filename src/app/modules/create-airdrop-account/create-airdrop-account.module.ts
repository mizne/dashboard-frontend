import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateAirdropAccountComponent } from './components/create-airdrop-account.component';
import { CreateAirdropAccountService } from './create-airdrop-account.service';
@NgModule({
  imports: [SharedModule],
  exports: [CreateAirdropAccountComponent],
  declarations: [CreateAirdropAccountComponent],
  providers: [CreateAirdropAccountService],
})
export class CreateAirdropAccountModule { }
