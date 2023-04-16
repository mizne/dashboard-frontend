import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { OverviewRoutingModule } from './overview-routing.module';
import { CreateProjectModule } from 'src/app/modules/create-project';

import { OverviewComponent } from './overview.component';
import { components } from './components';

@NgModule({
  imports: [SharedModule, OverviewRoutingModule, CreateProjectModule],
  declarations: [OverviewComponent, ...components],
  exports: [OverviewComponent],
  providers: [],
})
export class OverviewModule { }
