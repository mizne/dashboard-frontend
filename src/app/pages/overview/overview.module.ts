import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { OverviewRoutingModule } from './overview-routing.module';
import { CreateProjectModule } from 'src/app/modules/create-project';
import { CexTokenSymbolItemModule } from 'src/app/modules/cex-token-symbol-item';

import { OverviewComponent } from './overview.component';
import { components } from './components';

@NgModule({
  imports: [SharedModule, OverviewRoutingModule, CreateProjectModule, CexTokenSymbolItemModule],
  declarations: [OverviewComponent, ...components],
  exports: [OverviewComponent],
  providers: [],
})
export class OverviewModule { }
