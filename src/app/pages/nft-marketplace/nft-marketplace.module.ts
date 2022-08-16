import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NFTMarketplaceRoutingModule } from './nft-marketplace-routing.module';

import { NFTMarketplaceComponent } from './nft-marketplace.component';
import { components } from './components';
import { services } from './services';

@NgModule({
  imports: [
    CommonModule,
    NFTMarketplaceRoutingModule,
    NzButtonModule,
    NzCardModule,
    NzRadioModule,
    NzSelectModule,
    NzGridModule,
    ReactiveFormsModule,
  ],
  declarations: [NFTMarketplaceComponent, ...components],
  providers: [...services],
  exports: [NFTMarketplaceComponent],
})
export class NFTMarketplaceModule {}
