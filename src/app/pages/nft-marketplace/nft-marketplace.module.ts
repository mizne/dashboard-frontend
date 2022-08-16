import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';

import { NFTMarketplaceRoutingModule } from './nft-marketplace-routing.module';
import { NFTMarketplaceComponent } from './nft-marketplace.component';
import { components } from './components';
import { services } from './services';

@NgModule({
  imports: [SharedModule, NFTMarketplaceRoutingModule],
  declarations: [NFTMarketplaceComponent, ...components],
  providers: [...services],
  exports: [NFTMarketplaceComponent],
})
export class NFTMarketplaceModule {}
