import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder } from '@angular/forms';
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
  loading = false;

  constructor(
    private readonly cexTokenAlertService: CexTokenAlertService,
    private readonly notification: NzNotificationService,
    private readonly klineIntervalService: KlineIntervalService,
    private readonly fb: FormBuilder
  ) { }

  initLatestIntervals = 1;
  initInterval = KlineIntervals.FOUR_HOURS
  intervals = [
    {
      label: '4h',
      value: KlineIntervals.FOUR_HOURS
    },
    {
      label: '1d',
      value: KlineIntervals.ONE_DAY
    }
  ]
  form = this.fb.group({
    latestIntervals: [this.initLatestIntervals],
    interval: [this.initInterval]
  })

  latestTime = this.klineIntervalService.resolveFourHoursIntervalMills(this.initLatestIntervals);

  ngOnInit(): void {
    this.fetchCexTokenAlerts()
    this.listenFormChange();
  }

  resetForm() {
    this.form.patchValue({
      latestIntervals: 1,
      interval: KlineIntervals.FOUR_HOURS
    })
    this.fetchCexTokenAlerts()
  }

  submitForm() {
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

    this.fetchCexTokenAlerts()
  }

  private listenFormChange() {
    this.form.valueChanges.subscribe(v => {
      const latestIntervals = v?.latestIntervals as number;
      const interval = v?.interval as KlineIntervals;
      switch (interval) {
        case KlineIntervals.FOUR_HOURS:
          this.latestTime = this.klineIntervalService.resolveFourHoursIntervalMills(latestIntervals)
          return

        case KlineIntervals.ONE_DAY:
          this.latestTime = this.klineIntervalService.resolveOneDayIntervalMills(latestIntervals)
          return

        default:
          console.warn(`[CexTokenAlertSelectComponent] listenFormChange() unknown interval: ${interval}`)
          this.latestTime = this.klineIntervalService.resolveFourHoursIntervalMills(latestIntervals)
          return
      }
    })
  }

  private fetchCexTokenAlerts() {
    this.loading = true;
    const interval = this.form.get('interval')?.value as KlineIntervals
    this.cexTokenAlertService.queryList({
      time: this.latestTime,
      interval: interval
    })
      .subscribe((items) => {
        for (const panel of this.panels) {
          panel.cexTokenAlerts = items.filter(item => item.type === panel.type)
        }

        this.loading = false;
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