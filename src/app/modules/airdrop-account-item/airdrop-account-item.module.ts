import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { AirdropAccountItemComponent } from './airdrop-account-item.component'
// import { AirdropAccountMoreModule } from 'src/app/modules/followed-project-more';

@NgModule({
  imports: [
    SharedModule,
    // AirdropAccountMoreModule
  ],
  exports: [AirdropAccountItemComponent],
  declarations: [AirdropAccountItemComponent],
  providers: [],
})
export class AirdropAccountItemModule { }
