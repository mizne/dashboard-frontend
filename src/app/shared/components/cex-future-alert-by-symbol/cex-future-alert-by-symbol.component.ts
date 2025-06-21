import {
  Component,
  OnDestroy,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { KlineIntervalService } from '../../services';
import { CexFutureAlert, CexFutureAlertDirections, KlineIntervals } from '../../models';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexFutureAlertService } from '../../services/cex-future-alert.service';


@Component({
  selector: 'app-cex-future-alert-by-symbol',
  templateUrl: './cex-future-alert-by-symbol.component.html',
})
export class CexFutureAlertBySymbolComponent implements OnDestroy, OnInit, OnChanges {

  @Input() symbol = 'BTCUSDT'

  loading = false;


  constructor(
    private readonly cexFutureAlertService: CexFutureAlertService,
    private readonly notification: NzNotificationService,
    private readonly klineIntervalService: KlineIntervalService,
    private readonly fb: FormBuilder
  ) { }

  items: CexFutureAlert[] = [];

  latestIntervals = 18

  ngOnChanges(changes: SimpleChanges): void {
    this.fetchCexFutureAlerts()
  }

  cexFutureAlertColorGetter(item: CexFutureAlert) {
    switch (item.direction) {
      case CexFutureAlertDirections.LONG:
        return `success`
      case CexFutureAlertDirections.SHORT:
        return `error`
      case CexFutureAlertDirections.SHOCK:
        return `warning`
      default:
        return `default`
    }
  }

  ngOnInit(): void {
    this.fetchCexFutureAlerts()
  }

  ngOnDestroy(): void { }


  private fetchCexFutureAlerts() {
    this.loading = true
    this.cexFutureAlertService.queryList({
      time: {
        $gte: this.klineIntervalService.resolveFourHoursIntervalMills(this.latestIntervals),
        $lte: new Date().getTime()
      },
      interval: KlineIntervals.FOUR_HOURS,
      symbol: this.symbol
    })
      .subscribe((items) => {
        this.items = items;
        this.loading = false;
      })
  }


}