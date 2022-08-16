import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { FundRaiseRoutingModule } from './fund-raise-routing.module';

import { FundRaiseComponent } from './fund-raise.component';
import { services } from './services';

@NgModule({
  imports: [SharedModule, FundRaiseRoutingModule],
  declarations: [FundRaiseComponent],
  exports: [FundRaiseComponent],
  providers: [...services],
})
export class FundRaiseModule {}
