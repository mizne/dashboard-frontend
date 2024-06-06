import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, merge, Subject, Subscription } from 'rxjs';
import { isEmpty } from 'src/app/utils';
import { CexFutureService, KlineIntervalService } from '../../services';
import { CexFuture, CexFutureAlert, CexFutureAlertTypes, KlineIntervals } from '../../models';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexFutureAlertService } from '../../services/cex-future-alert.service';


export const CEX_FUTURE_ALERT_SELECT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CexFutureAlertSelectComponent),
  multi: true
};

@Component({
  selector: 'app-cex-future-alert-select',
  templateUrl: './cex-future-alert-select.component.html',
  providers: [CEX_FUTURE_ALERT_SELECT_VALUE_ACCESSOR]
})
export class CexFutureAlertSelectComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;

  selectedSymbol = '';

  panels: Array<{
    type: CexFutureAlertTypes,
    name: string;
    cexFutureAlerts: CexFutureAlert[];
  }> = [
      {
        name: '资金费率过高/过低',
        type: CexFutureAlertTypes.FUNDING_RATE_LIMIT,
        cexFutureAlerts: []
      },
      {
        name: '未平仓量暴涨/暴跌',
        type: CexFutureAlertTypes.OPEN_INTEREST_LIMIT,
        cexFutureAlerts: []
      },
      {
        name: '多空比暴涨/暴跌',
        type: CexFutureAlertTypes.LONG_SHORT_RATIO_LIMIT,
        cexFutureAlerts: []
      }
    ];

  constructor(
    private readonly cexFutureAlertService: CexFutureAlertService,
    private readonly notification: NzNotificationService,
    private readonly klineIntervalService: KlineIntervalService,
  ) { }

  ngOnInit(): void {
    this.fetchCexFutureAlerts()
  }

  selectCexFutureAlert(item: CexFutureAlert) {
    this.selectedSymbol = item.symbol;
    this.emitValue();
  }

  ngOnDestroy(): void { }

  emitValue() {
    if (this.onChange) {
      this.onChange(this.selectedSymbol)
    }
  }

  writeValue(symbol: string): void {
    if (symbol) {
      this.selectedSymbol = symbol;
    } else {
      this.selectedSymbol = '';
    }
  }

  private fetchCexFutureAlerts() {
    this.cexFutureAlertService.queryList({
      time: this.klineIntervalService.resolveFourHoursIntervalMills(1),
      interval: KlineIntervals.FOUR_HOURS
    })
      .subscribe((items) => {
        for (const panel of this.panels) {
          panel.cexFutureAlerts = items.filter(item => item.type === panel.type)
        }
      })
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    // noop
  }
  setDisabledState?(isDisabled: boolean): void {
    // noop
  }
}