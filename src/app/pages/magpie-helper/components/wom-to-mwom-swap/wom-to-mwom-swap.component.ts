import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { switchMap, from, of, throwError, debounceTime, catchError } from 'rxjs';
import { MagpieHelperService, WalletService } from 'src/app/shared';

@Component({
  selector: 'wom-to-mwom-swap',
  templateUrl: './wom-to-mwom-swap.component.html'
})

export class WomToMwomSwapComponent implements OnInit {
  constructor(
    public walletService: WalletService,
    private readonly magpieHelperService: MagpieHelperService,
    private readonly notificationService: NzNotificationService
  ) { }

  amountCtrl = new FormControl<string>('0')
  womTokenBalanceLoading = false;
  womTokenBalance = 0;
  suggestAmounts = [
    {
      label: '5k',
      value: 5000
    },
    {
      label: '10k',
      value: 10000
    },
    {
      label: '20k',
      value: 20000
    },
    {
      label: '40k',
      value: 40000
    },
    {
      label: '80k',
      value: 80000
    }
  ]

  preSwapMwomAmount = 0;
  swapRatio = 0;
  preSwapLoading = false;
  swapLoading = false;

  ngOnInit() {
    this.subscribeWomBalanceChange()
    this.subscribeInputChange()
  }

  applyMaxAmountSwap() {
    this.amountCtrl.patchValue(Math.floor(this.womTokenBalance) + '')
  }

  applyAmountSwap(n: number) {
    this.amountCtrl.patchValue(n + '')
  }

  async swap() {
    if (this.preSwapMwomAmount > 0) {
      if (this.walletService.selectedChain === 'bnb') {
        await this.swapOnBNB()
      } else if (this.walletService.selectedChain === 'arbitrum') {
        await this.swapOnArb()
      } else {
        this.notificationService.error(`wom -> mwom error`, `unsupport network: ${this.walletService.selectedChain}`);
      }
    }
  }

  private async swapOnBNB() {
    this.swapLoading = true
    try {
      await this.walletService.swapAmountOfWom2MwomOnBNB(Number(this.amountCtrl.value), this.preSwapMwomAmount)
      this.notificationService.success(`wom -> mwom on BNB 成功`, `wom -> mwom on BNB 成功`)
      this.amountCtrl.patchValue('0', { emitEvent: false })
      this.preSwapMwomAmount = 0;
      this.magpieHelperService.womMwomSwapSuccess()
    } catch (e) {
      this.preSwapMwomAmount = 0;
      this.notificationService.error(`wom -> mwom on BNB 报错`, `${(e as Error).message}`);
      this.magpieHelperService.womMwomSwapError(e as Error)
    } finally {
      this.swapLoading = false;
    }
  }

  private async swapOnArb() {
    this.swapLoading = true
    try {
      await this.walletService.swapAmountOfWom2MwomOnArb(Number(this.amountCtrl.value), this.preSwapMwomAmount)
      this.notificationService.success(`wom -> mwom on Arb 成功`, `wom -> mwom on Arb 成功`)
      this.amountCtrl.patchValue('0', { emitEvent: false })
      this.preSwapMwomAmount = 0;
      this.magpieHelperService.womMwomSwapSuccess()
    } catch (e) {
      this.preSwapMwomAmount = 0;
      this.notificationService.error(`wom -> mwom on Arb 报错`, `${(e as Error).message}`);
      this.magpieHelperService.womMwomSwapError(e as Error)
    } finally {
      this.swapLoading = false;
    }
  }

  private async fetchWomBalanceInWallet() {
    this.womTokenBalanceLoading = true
    this.womTokenBalance = await this.walletService.getWomTokenBalance();
    this.womTokenBalanceLoading = false
  }

  private subscribeWomBalanceChange() {
    this.walletService.walletConnectStatus.asObservable().subscribe((connectSuccess) => {
      if (connectSuccess) {
        this.fetchWomBalanceInWallet()
      } else {
        this.womTokenBalance = 0;
      }
    })
    this.magpieHelperService.swapSuccessObs.subscribe(() => {
      this.fetchWomBalanceInWallet()
    })
  }

  private subscribeInputChange() {
    this.amountCtrl.valueChanges.pipe(
      debounceTime(500),
      switchMap((input: string | null) => {
        this.preSwapLoading = true
        const amount = Number(input);
        if (isNaN(amount) || amount <= 0) {
          this.handlePreSwapError(`wom amount invalid`)
          return of(0)
        }
        if (this.walletService.selectedChain === 'bnb') {
          return from(this.walletService.preSwapAmountOfWom2MwomOnBNB(amount)).pipe(
            catchError((e: Error) => {
              this.handlePreSwapError(e.message)
              return of(0)
            })
          )
        } else if (this.walletService.selectedChain === 'arbitrum') {
          return from(this.walletService.preSwapAmountOfWom2MwomOnArb(amount)).pipe(
            catchError((e: Error) => {
              this.handlePreSwapError(e.message)
              return of(0)
            })
          )
        } else {
          this.handlePreSwapError(`unsupport network: ${this.walletService.selectedChain}`)
          return of(0)
        }

      }),
    ).subscribe({
      next: (v) => {
        if (v > 0) {
          this.preSwapLoading = false
          this.preSwapMwomAmount = v
          this.swapRatio = Number((Number(this.amountCtrl.value) / this.preSwapMwomAmount).toFixed(4))
        }
      },
      error: (e: Error) => {
      }
    })
  }

  private handlePreSwapError(msg: string) {
    this.preSwapLoading = false
    this.notificationService.warning(`preswap error`, `${msg}`);
  }
}