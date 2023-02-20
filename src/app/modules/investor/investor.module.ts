import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { components } from './components';
import { CreateInvestorService } from './create-investor.service';

@NgModule({
  imports: [SharedModule],
  exports: [...components],
  declarations: [...components],
  providers: [CreateInvestorService],
})
export class InvestorModule { }
