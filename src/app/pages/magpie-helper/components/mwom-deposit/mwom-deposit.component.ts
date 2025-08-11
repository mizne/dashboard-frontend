import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ethers } from 'ethers';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MagpieHelperService, WalletService } from 'src/app/shared';

@Component({
  selector: 'mwom-deposit',
  templateUrl: './mwom-deposit.component.html'
})

export class MwomDepositComponent implements OnInit {
  constructor(
    public walletService: WalletService,
    private readonly magpieHelperService: MagpieHelperService,
    private readonly notificationService: NzNotificationService
  ) { }

  depositAmountCtrl = new FormControl<string>('0')
  depositLoading = false
  mwomTokenBalance = 0;
  mwomTokenBalanceLoading = false;


  ngOnInit() {
    this.walletService.walletConnectStatus.asObservable().subscribe((connectSuccess) => {
      if (connectSuccess) {
        this.fetchMwomBalanceInWallet()
      } else {
        this.mwomTokenBalance = 0
      }
    })
    this.magpieHelperService.withdrawSuccessObs.subscribe(() => {
      this.fetchMwomBalanceInWallet()
    })

    this.magpieHelperService.swapSuccessObs.subscribe(() => {
      this.fetchMwomBalanceInWallet()
    })
  }

  applyMaxAmountDeposit() {
    this.depositAmountCtrl.patchValue(Math.floor(this.mwomTokenBalance) + '')
  }

  async depositMwom() {
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
      await this.walletService.depositMwom(amountWei)
      this.notificationService.success(`充值mwom成功`, `充值mwom成功`)
      this.depositAmountCtrl.patchValue('0')
      this.fetchMwomBalanceInWallet()

      this.magpieHelperService.mwomDepositSuccess()
    } catch (e) {
      this.notificationService.error(`充值mwom报错`, `${(e as Error).message}`);

      this.magpieHelperService.mwomDepositError(e as Error)
    } finally {
      this.depositLoading = false;
    }
  }

  async fetchMwomBalanceInWallet() {
    this.mwomTokenBalanceLoading = true
    this.mwomTokenBalance = await this.walletService.getMwomTokenBalance();
    this.mwomTokenBalanceLoading = false
  }
}