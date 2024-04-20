import { NgModule } from '@angular/core';
import { AirdropInteractionRecordRoutingModule } from './airdrop-interaction-record-routing.module';
import { SharedModule } from 'src/app/shared';
import { AirdropInteractionRecordComponent } from './airdrop-interaction-record.component';
import { AirdropInteractionRecordManagerModule } from 'src/app/modules/airdrop-interaction-record-manager'

@NgModule({
  imports: [
    SharedModule,
    AirdropInteractionRecordRoutingModule,
    AirdropInteractionRecordManagerModule
  ],
  declarations: [AirdropInteractionRecordComponent],
  exports: [AirdropInteractionRecordComponent],
})
export class AirdropInteractionRecordModule { }
