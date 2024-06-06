import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KlineIntervalService } from '../../services';
import { KlineIntervals } from '../../models';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenAlert, CexTokenAlertTypes } from '../../models/cex-token-alert.model';
import { CexTokenAlertService } from '../../services/cex-token-alert.service';


export const CEX_TOKEN_ALERT_SELECT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CexTokenAlertSelectComponent),
  multi: true
};

@Component({
  selector: 'app-cex-token-alert-select',
  templateUrl: './cex-token-alert-select.component.html',
  providers: [CEX_TOKEN_ALERT_SELECT_VALUE_ACCESSOR]
})
export class CexTokenAlertSelectComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;

  selectedSymbol = '';

  panels: Array<{
    type: CexTokenAlertTypes,
    name: string;
    cexTokenAlerts: CexTokenAlert[];
  }> = [
      {
        name: '交易量暴涨',
        type: CexTokenAlertTypes.BIG_VOLUME,
        cexTokenAlerts: []
      },
      {
        name: '交易量超过BTCUSDT',
        type: CexTokenAlertTypes.VOLUME_ABOVE_BTCUSDT,
        cexTokenAlerts: []
      },
      {
        name: '价格趋势转折',
        type: CexTokenAlertTypes.TRENDING_CHANGE,
        cexTokenAlerts: []
      }
    ];

  constructor(
    private readonly cexTokenAlertService: CexTokenAlertService,
    private readonly notification: NzNotificationService,
    private readonly klineIntervalService: KlineIntervalService,
  ) { }

  ngOnInit(): void {
    this.fetchCexTokenAlerts()
  }

  selectCexTokenAlert(item: CexTokenAlert) {
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

  private fetchCexTokenAlerts() {
    this.cexTokenAlertService.queryList({
      time: this.klineIntervalService.resolveFourHoursIntervalMills(1),
      interval: KlineIntervals.FOUR_HOURS
    })
      .subscribe((items) => {
        for (const panel of this.panels) {
          panel.cexTokenAlerts = items.filter(item => item.type === panel.type)
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