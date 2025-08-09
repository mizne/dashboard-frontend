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

  amountCtrl = new FormControl<string>('0')
  withdrawLoading = false
  mWomStakedAmount = 0;

  ngOnInit(): void {
    this.networkCtrl.valueChanges.subscribe(chain => {
      this.walletService.setChain(chain as SupportedChain)
    })
  }


  connectWallet(wallet: SupportedWallet) {
    this.walletService.connect(wallet)
      .then(() => {
        this.fetchMWomStakedAmount()
      }).catch(err => alert(err.message))
  }

  disconnectWallet() {
    this.walletService.disconnect();
  }

  applyMaxAmountWithdraw() {
    this.amountCtrl.patchValue(this.mWomStakedAmount + '')
  }

  async withdrawMWOM() {
    this.withdrawLoading = true;
    const amount = Number(this.amountCtrl.value);
    if (isNaN(amount)) {
      this.notificationService.warning(`提取数量非法`, `提取数量非法`);
      this.withdrawLoading = false;
      return
    }

    const amountWei = ethers.parseUnits(this.amountCtrl.value as string, 18);
    console.log(`amountWei: ${amountWei}`);

    try {
      await this.walletService.withdrawMWOM(amountWei)
      this.notificationService.success(`提取mwom成功`, `提取mwom成功`)
      this.fetchMWomStakedAmount()
    } catch (e) {
      this.notificationService.error(`提取mwom报错`, `${(e as Error).message}`);
    } finally {
      this.withdrawLoading = false;
    }
  }

  async fetchMWomStakedAmount() {
    this.mWomStakedAmount = await this.walletService.getMWomStakedAmount()
  }
}
