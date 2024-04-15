import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateAirdropInteractionRecordComponent } from './components/create-airdrop-interaction-record.component';
import { CreateAirdropInteractionRecordService } from './create-airdrop-interaction-record.service';
import { AirdropAccountSelectModule } from 'src/app/modules/airdrop-account-select'
import { AirdropJobSelectModule } from 'src/app/modules/airdrop-job-select'

@NgModule({
  imports: [SharedModule, AirdropAccountSelectModule, AirdropJobSelectModule],
  exports: [CreateAirdropInteractionRecordComponent],
  declarations: [CreateAirdropInteractionRecordComponent],
  providers: [CreateAirdropInteractionRecordService],
})
export class CreateAirdropInteractionRecordModule { }
