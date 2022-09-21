import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  KlineIntervalService,
  SharedService,
  TimerService,
} from '../../services';
import {
  firstValueFrom,
  merge,
  startWith,
  Subscription,
  filter,
  map,
  Observable,
} from 'rxjs';
import { FormControl } from '@angular/forms';
import { KlineIntervals } from '../../models';

@Component({
  selector: 'btc-future-checker',
  templateUrl: 'btc-future-checker.component.html',
})
export class BtcFutureCheckerComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private timerService: TimerService,
    private klineIntervalService: KlineIntervalService,
    private notification: NzNotificationService
  ) {}

  intervals = [
    {
      label: '4h',
      value: KlineIntervals.FOUR_HOURS,
    },
    {
      label: '1d',
      value: KlineIntervals.ONE_DAY,
    },
  ];
  intervalCtrl = new FormControl(this.intervals[0].value);
  time = 0;
  interval = this.intervals[0].value;
  days = 0;

  visible = false;

  items: Array<{
    label: string;
    key:
      | 'prices'
      | 'volumes'
      | 'fundingRates'
      | 'longShortRatios'
      | 'openInterests'
      | 'dominances'
      | 'dominancesExcludeStableCoins';
    status: 'success' | 'error' | 'loading';
    message: string;
    values: number[];
    chartOptions: {
      chartType: 'line' | 'bar' | 'area';
      priceMode?: boolean;
      regionFilters?: Array<any>;
    };
  }> = [
    {
      label: 'price',
      key: 'prices',
      status: 'loading',
      message: 'loading',
      values: [],
      chartOptions: {
        chartType: 'line',
        priceMode: true,
      },
    },
    {
      label: 'volume',
      key: 'volumes',
      status: 'loading',
      message: 'loading',
      values: [],
      chartOptions: {
        chartType: 'bar',
      },
    },
    {
      label: 'funding rate',
      key: 'fundingRates',
      status: 'loading',
      message: 'loading',
      values: [],
      chartOptions: {
        chartType: 'bar',
      },
    },
    {
      label: 'long/short ratio',
      key: 'longShortRatios',
      status: 'loading',
      message: 'loading',
      values: [],
      chartOptions: {
        chartType: 'line',
        regionFilters: [
          {
            top: true,
            start: ['min', 1.0],
            end: ['max', 'min'],
            color: 'red',
          },
          {
            top: true,
            start: ['min', 'max'],
            end: ['max', 1.0],
            color: 'green',
          },
        ],
      },
    },
    {
      label: 'open interest',
      key: 'openInterests',
      status: 'loading',
      message: 'loading',
      values: [],
      chartOptions: {
        chartType: 'area',
      },
    },
    {
      label: 'dominance',
      key: 'dominances',
      status: 'loading',
      message: 'loading',
      values: [],
      chartOptions: {
        chartType: 'line',
      },
    },
    {
      label: 'dominance exclude stable coins',
      key: 'dominancesExcludeStableCoins',
      status: 'loading',
      message: 'loading',
      values: [],
      chartOptions: {
        chartType: 'line',
      },
    },
  ];

  status: 'loading' | 'error' | 'success' | '' = '';
  subscription: Subscription = Subscription.EMPTY;

  ngOnInit() {}

  open(): void {
    this.visible = true;
    this.intervalCheckBtcFutures();
  }

  close(): void {
    this.visible = false;
    this.subscription.unsubscribe();
  }

  refresh() {
    this.fetchData();
  }

  private async intervalCheckBtcFutures() {
    this.subscription = merge(
      this.timerService.interval(10 * 60),
      this.sharedService
        .documentVisible()
        .pipe(filter((e, i) => !!e && i !== 0))
    )
      .pipe(
        startWith(0),
        filter(() => this.status !== 'loading')
      )
      .subscribe(() => {
        this.fetchData();
      });
  }

  private async fetchData() {
    try {
      this.status = 'loading';
      for (const con of this.items) {
        con.message = 'loading';
        con.status = 'loading';
      }
      const obj = await firstValueFrom(
        this.sharedService.btcDailies(
          this.intervalCtrl.value || KlineIntervals.FOUR_HOURS
        )
      );
      this.time = this.resolveTime();
      this.interval = this.intervalCtrl.value as KlineIntervals;
      this.days = this.resolveDays();
      this.status = 'success';

      for (const con of this.items) {
        con.status = 'success';
        con.message = 'success';
        con.values = obj[con.key];
      }
    } catch (e) {
      this.notification.error(`获取btc futures失败`, `${(e as Error).message}`);
      this.status = 'error';

      for (const con of this.items) {
        con.status = 'error';
        con.message = 'error';
        con.values = [];
      }
    }
  }

  private resolveTime() {
    switch (this.intervalCtrl.value) {
      case KlineIntervals.FOUR_HOURS:
        return this.klineIntervalService.resolveFourHoursIntervalMills(0);
      case KlineIntervals.ONE_DAY:
        return this.klineIntervalService.resolveOneDayIntervalMills(0);
      default:
        console.error(
          `[BtcFutureCheckerComponent] resolveTime() unknown interval: ${this.intervalCtrl.value}`
        );
        return this.klineIntervalService.resolveFourHoursIntervalMills(0);
    }
  }

  private resolveDays() {
    switch (this.intervalCtrl.value) {
      case KlineIntervals.FOUR_HOURS:
        return 30;
      case KlineIntervals.ONE_DAY:
        return 180;
      default:
        console.warn(
          `[BtcFutureCheckerComponent] unknown interval: ${this.intervalCtrl.value}`
        );
        return 30;
    }
  }
}
