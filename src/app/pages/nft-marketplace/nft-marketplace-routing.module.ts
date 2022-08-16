import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NFTMarketplaceComponent } from './nft-marketplace.component';

const routes: Routes = [{ path: '', component: NFTMarketplaceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NFTMarketplaceRoutingModule {}
