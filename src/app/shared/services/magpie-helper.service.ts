import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class MagpieHelperService {

  private readonly withdrawSuccess = new Subject<void>()
  public readonly withdrawSuccessObs = this.withdrawSuccess.asObservable()

  private readonly withdrawError = new Subject<Error>()
  public readonly withdrawErrorObs = this.withdrawError.asObservable()

  private readonly depositSuccess = new Subject<void>()
  public readonly depositSuccessObs = this.depositSuccess.asObservable()

  private readonly depositError = new Subject<Error>()
  public readonly depositErrorObs = this.depositError.asObservable()

  private readonly swapSuccess = new Subject<void>()
  public readonly swapSuccessObs = this.swapSuccess.asObservable()

  private readonly swapError = new Subject<Error>()
  public readonly swapErrorObs = this.swapError.asObservable()


  constructor() { }

  mwomWithdrawSuccess() {
    this.withdrawSuccess.next()
  }

  mwomWithdrawError(e: Error) {
    this.withdrawError.next(e)
  }

  mwomDepositSuccess() {
    this.depositSuccess.next()
  }

  mwomDepositError(e: Error) {
    this.depositError.next(e)
  }

  womMwomSwapSuccess() {
    this.swapSuccess.next()
  }

  womMwomSwapError(e: Error) {
    this.swapError.next(e)
  }
}