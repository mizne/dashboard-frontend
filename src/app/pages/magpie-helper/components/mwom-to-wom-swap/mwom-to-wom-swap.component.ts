import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { switchMap, from, of, throwError, debounceTime, catchError } from 'rxjs';
import { MagpieHelperService, WalletService } from 'src/app/shared';

@Component({
  selector: 'mwom-to-wom-swap',
  templateUrl: './mwom-to-wom-swap.component.html'
})

export class MwomToWomSwapComponent implements OnInit {
  constructor(
    public walletService: WalletService,
    private readonly magpieHelperService: MagpieHelperService,
    private readonly notificationService: NzNotificationService
  ) { }

  amountCtrl = new FormControl<string>('0')
  mwomTokenBalanceLoading = false;
  mwomTokenBalance = 0;
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

  preSwapWomAmount = 0;
  swapRatio = 0;
  preSwapLoading = false;
  swapLoading = false;

  ngOnInit() {
    this.subscribeMwomBalanceChange()
    this.subscribeInputChange()
  }

  applyMaxAmountSwap() {
    this.amountCtrl.patchValue(Math.floor(this.mwomTokenBalance) + '')
  }

  applyAmountSwap(n: number) {
    this.amountCtrl.patchValue(n + '')
  }

  async swap() {
    if (this.preSwapWomAmount > 0) {
      if (this.walletService.selectedChain === 'bnb') {
        await this.swapOnBNB()
      } else if (this.walletService.selectedChain === 'arbitrum') {
        await this.swapOnArb()
      } else {
        this.notificationService.error(`mwom -> wom error`, `unsupport network: ${this.walletService.selectedChain}`);
      }
    }
  }

  private async swapOnBNB() {
    this.swapLoading = true
    try {
      await this.walletService.swapAmountOfMwom2WomOnBNB(Number(this.amountCtrl.value), this.preSwapWomAmount)
      this.notificationService.success(`mwom -> wom on BNB 成功`, `mwom -> wom on BNB 成功`)
      this.amountCtrl.patchValue('0', { emitEvent: false })
      this.preSwapWomAmount = 0;
      this.magpieHelperService.womMwomSwapSuccess()
    } catch (e) {
      this.preSwapWomAmount = 0;
      this.notificationService.error(`mwom -> wom on BNB 报错`, `${(e as Error).message}`);
      this.magpieHelperService.womMwomSwapError(e as Error)
    } finally {
      this.swapLoading = false;
    }
  }

  private async swapOnArb() {
    this.swapLoading = true
    try {
      await this.walletService.swapAmountOfMwom2WomOnArb(Number(this.amountCtrl.value), this.preSwapWomAmount)
      this.notificationService.success(`mwom -> wom on Arb 成功`, `mwom -> wom on Arb 成功`)
      this.amountCtrl.patchValue('0', { emitEvent: false })
      this.preSwapWomAmount = 0;
      this.magpieHelperService.womMwomSwapSuccess()
    } catch (e) {
      this.preSwapWomAmount = 0;
      this.notificationService.error(`mwom -> wom on Arb 报错`, `${(e as Error).message}`);
      this.magpieHelperService.womMwomSwapError(e as Error)
    } finally {
      this.swapLoading = false;
    }
  }

  private async fetchMwomBalanceInWallet() {
    this.mwomTokenBalanceLoading = true
    this.mwomTokenBalance = await this.walletService.getMwomTokenBalance();
    this.mwomTokenBalanceLoading = false
  }

  private subscribeMwomBalanceChange() {
    this.walletService.walletConnectStatus.asObservable().subscribe((connectSuccess) => {
      if (connectSuccess) {
        this.fetchMwomBalanceInWallet()
      } else {
        this.mwomTokenBalance = 0;
      }
    })
    this.magpieHelperService.swapSuccessObs.subscribe(() => {
      this.fetchMwomBalanceInWallet()
    })
    this.magpieHelperService.withdrawSuccessObs.subscribe(() => {
      this.fetchMwomBalanceInWallet()
    })
    this.magpieHelperService.depositSuccessObs.subscribe(() => {
      this.fetchMwomBalanceInWallet()
    })
  }

  private subscribeInputChange() {
    this.amountCtrl.valueChanges.pipe(
      debounceTime(500),
      switchMap((input: string | null) => {
        this.preSwapLoading = true
        const amount = Number(input);
        if (isNaN(amount) || amount <= 0) {
          this.handlePreSwapError(`mwom amount invalid`)
          return of(0)
        }
        if (this.walletService.selectedChain === 'bnb') {
          return from(this.walletService.preSwapAmountOfMwom2WomOnBNB(amount)).pipe(
            catchError((e: Error) => {
              this.handlePreSwapError(e.message)
              return of(0)
            })
          )
        } else if (this.walletService.selectedChain === 'arbitrum') {
          return from(this.walletService.preSwapAmountOfMwom2WomOnArb(amount)).pipe(
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
          this.preSwapWomAmount = v
          this.swapRatio = Number((this.preSwapWomAmount / Number(this.amountCtrl.value)).toFixed(4))
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