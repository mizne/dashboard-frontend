import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FundRaiseRoutingModule } from './fund-raise-routing.module';

import { FundRaiseComponent } from './fund-raise.component';

@NgModule({
  imports: [FundRaiseRoutingModule, NzButtonModule],
  declarations: [FundRaiseComponent],
  exports: [FundRaiseComponent],
})
export class FundRaiseModule {}
