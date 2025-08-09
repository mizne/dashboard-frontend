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

  depositAmountCtrl = new FormControl<string>('0')
  depositLoading = false
  mWomTokenBalance = 0;
  mWomTokenBalanceLoading = false;

  withdrawAmountCtrl = new FormControl<string>('0')
  withdrawLoading = false
  mWomStakedAmount = 0;
  mWomStakedAmountLoading = false;

  ngOnInit(): void {
    this.networkCtrl.valueChanges.subscribe(chain => {
      this.walletService.setChain(chain as SupportedChain)
    })
  }


  connectWallet(wallet: SupportedWallet) {
    this.walletService.connect(wallet)
      .then(() => {
        this.fetchMWomStakedAmount()

        this.fetchMWomBalanceInWallet()
      }).catch(err => alert(err.message))
  }

  disconnectWallet() {
    this.walletService.disconnect();
  }

  applyMaxAmountDeposit() {
    this.depositAmountCtrl.patchValue(this.mWomTokenBalance + '')
  }

  async depositMWOM() {
    this.depositLoading = true;
    const amount = Number(this.depositAmountCtrl.value);
    if (isNaN(amount) || amount <= 0) {
      this.notificationService.warning(`充值数量非法`, `充值数量非法`);
      this.depositLoading = false;
      return
    }

    const amountWei = ethers.parseUnits(this.depositAmountCtrl.value as string, 18);
    console.log(`amountWei: ${amountWei}`);

    try {
      await this.walletService.depositMWOM(amountWei)
      this.notificationService.success(`充值mwom成功`, `充值mwom成功`)
      this.depositAmountCtrl.patchValue('0')
      this.fetchMWomBalanceInWallet()
      this.fetchMWomStakedAmount()
    } catch (e) {
      this.notificationService.error(`充值mwom报错`, `${(e as Error).message}`);
    } finally {
      this.depositLoading = false;
    }
  }

  applyMaxAmountWithdraw() {
    this.withdrawAmountCtrl.patchValue(this.mWomStakedAmount + '')
  }

  async withdrawMWOM() {
    this.withdrawLoading = true;
    const amount = Number(this.withdrawAmountCtrl.value);
    if (isNaN(amount) || amount <= 0) {
      this.notificationService.warning(`提取数量非法`, `提取数量非法`);
      this.withdrawLoading = false;
      return
    }

    const amountWei = ethers.parseUnits(this.withdrawAmountCtrl.value as string, 18);
    console.log(`amountWei: ${amountWei}`);

    try {
      await this.walletService.withdrawMWOM(amountWei)
      this.notificationService.success(`提取mwom成功`, `提取mwom成功`)
      this.withdrawAmountCtrl.patchValue('0')
      this.fetchMWomBalanceInWallet()
      this.fetchMWomStakedAmount()
    } catch (e) {
      this.notificationService.error(`提取mwom报错`, `${(e as Error).message}`);
    } finally {
      this.withdrawLoading = false;
    }
  }

  async fetchMWomStakedAmount() {
    this.mWomStakedAmountLoading = true
    this.mWomStakedAmount = await this.walletService.getMWomStakedAmount()
    this.mWomStakedAmountLoading = false
  }

  async fetchMWomBalanceInWallet() {
    this.mWomTokenBalanceLoading = true
    this.mWomTokenBalance = await this.walletService.getMWomTokenBalance();
    this.mWomTokenBalanceLoading = false
  }
}
