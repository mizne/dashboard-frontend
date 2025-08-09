import { Component, Input, OnInit } from '@angular/core';
import { WalletService, SupportedWallet, SupportedChain } from 'src/app/shared';

@Component({
  selector: 'app-magpie-helper',
  templateUrl: './magpie-helper.component.html',
  styleUrls: ['./magpie-helper.component.less'],
})
export class MagpieHelperComponent implements OnInit {
  constructor(public walletService: WalletService) { }

  ngOnInit(): void {
  }

  chains: SupportedChain[] = ['bnb', 'arbitrum'];
  wallets: SupportedWallet[] = ['metamask', 'walletconnect'];



  selectChain(chain: SupportedChain) {
    this.walletService.setChain(chain);
  }

  connectWallet(wallet: SupportedWallet) {
    this.walletService.connect(wallet).catch(err => alert(err.message));
  }

  disconnectWallet() {
    this.walletService.disconnect();
  }
}
