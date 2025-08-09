import { NgModule } from '@angular/core';
import { MagpieHelperRoutingModule } from './magpie-helper-routing.module';
import { SharedModule } from 'src/app/shared';
import { MagpieHelperComponent } from './magpie-helper.component';

@NgModule({
  imports: [
    SharedModule,
    MagpieHelperRoutingModule,
  ],
  declarations: [MagpieHelperComponent],
  exports: [MagpieHelperComponent],
})
export class MagpieHelperModule { }
