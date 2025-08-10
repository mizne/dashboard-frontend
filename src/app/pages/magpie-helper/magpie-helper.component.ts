import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ethers } from 'ethers';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, of } from 'rxjs';
import { WalletService, SupportedWallet, SupportedChain } from 'src/app/shared';

@Component({
  selector: 'app-magpie-helper',
  templateUrl: './magpie-helper.component.html',
  styleUrls: ['./magpie-helper.component.less'],
})
export class MagpieHelperComponent implements OnInit {
  constructor(public walletService: WalletService, private readonly notificationService: NzNotificationService) { }

  chains: SupportedChain[] = ['bnb', 'arbitrum'];
  wallets: Array<{ name: SupportedWallet, loading$: Observable<boolean> }> = [
    {
      name: 'metamask',
      loading$: of(false)
    }, {
      name: 'walletconnect',
      loading$: this.walletService.initWCProviderLoadingBehaviorSubject.asObservable()
    }];

  networkCtrl = new FormControl(this.walletService.selectedChain)


  ngOnInit(): void {
    this.networkCtrl.valueChanges.subscribe(chain => {
      this.walletService.setChain(chain as SupportedChain)
    })
  }


  connectWallet(wallet: SupportedWallet) {
    this.walletService.connect(wallet)
      .catch(err => {
        this.notificationService.error(`连接钱包失败`, `${err.message}`)
      })
  }

  disconnectWallet() {
    this.walletService.disconnect();
  }



}
