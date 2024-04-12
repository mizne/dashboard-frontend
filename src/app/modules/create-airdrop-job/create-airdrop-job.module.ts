import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateAirdropJobComponent } from './components/create-airdrop-job.component';
import { CreateAirdropJobService } from './create-airdrop-job.service';
import { FollowedProjectSelectModule } from 'src/app/modules/followed-project-select'

@NgModule({
  imports: [SharedModule, FollowedProjectSelectModule],
  exports: [CreateAirdropJobComponent],
  declarations: [CreateAirdropJobComponent],
  providers: [CreateAirdropJobService],
})
export class CreateAirdropJobModule { }
