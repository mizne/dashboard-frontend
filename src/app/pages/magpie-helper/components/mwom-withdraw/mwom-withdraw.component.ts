import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ethers } from 'ethers';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MagpieHelperService, WalletService } from 'src/app/shared';

@Component({
  selector: 'mwom-withdraw',
  templateUrl: './mwom-withdraw.component.html'
})

export class MwomWithdrawComponent implements OnInit {
  constructor(
    public walletService: WalletService,
    private readonly magpieHelperService: MagpieHelperService,
    private readonly notificationService: NzNotificationService
  ) { }

  withdrawAmountCtrl = new FormControl<string>('0')
  withdrawLoading = false
  mwomStakedAmount = 0;
  mwomStakedAmountLoading = false;


  ngOnInit() {
    this.walletService.walletConnectStatus.asObservable().subscribe((connectSuccess) => {
      if (connectSuccess) {
        this.fetchMwomStakedAmount()
      } else {
        this.mwomStakedAmount = 0;
      }
    })
    this.magpieHelperService.depositSuccessObs.subscribe(() => {
      this.fetchMwomStakedAmount()
    })
  }

  applyMaxAmountWithdraw() {
    this.withdrawAmountCtrl.patchValue(this.mwomStakedAmount + '')
  }

  async withdrawMwom() {
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
      await this.walletService.withdrawMwom(amountWei)
      this.notificationService.success(`提取mwom成功`, `提取mwom成功`)
      this.withdrawAmountCtrl.patchValue('0')
      this.fetchMwomStakedAmount()
      this.magpieHelperService.mwomWithdrawSuccess()
    } catch (e) {
      this.notificationService.error(`提取mwom报错`, `${(e as Error).message}`);
      this.magpieHelperService.mwomWithdrawError(e as Error)
    } finally {
      this.withdrawLoading = false;
    }
  }

  async fetchMwomStakedAmount() {
    this.mwomStakedAmountLoading = true
    this.mwomStakedAmount = await this.walletService.getMwomStakedAmount()
    this.mwomStakedAmountLoading = false
  }
}