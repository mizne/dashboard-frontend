import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedService } from '../../services';
import {
  delay,
  filter,
  first,
  firstValueFrom,
  map,
  merge,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { format } from 'date-fns';
import { sleep, stringifyMills } from 'src/app/utils';

@Component({
  selector: 'btc-future-checker',
  templateUrl: 'btc-future-checker.component.html',
})
export class BtcFutureCheckerComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private notification: NzNotificationService
  ) {}

  visible = false;

  items: Array<{
    label: string;
    key: 'prices' | 'fundingRates' | 'longShortRatios' | 'openInterests';
    status: 'success' | 'error' | 'loading';
    message: string;
    values: number[];
    chartOptions: {
      chartType: 'line' | 'bar' | 'area';
      priceMode: boolean;
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
      label: 'funding rate',
      key: 'fundingRates',
      status: 'loading',
      message: 'loading',
      values: [],
      chartOptions: {
        chartType: 'bar',
        priceMode: false,
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
        priceMode: false,
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
        priceMode: false,
      },
    },
  ];

  lastUpdateAtStr$: Observable<string> = of('');

  ngOnInit() {
    this.intervalCheckBtcFutures();
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  refresh() {
    this.fetchData();
  }

  private async intervalCheckBtcFutures() {
    merge(
      this.sharedService.schedule({
        hour: [0, 4, 8, 12, 16, 20],
        minute: 2,
        second: 42,
      }),
      this.sharedService.interval(10 * 60).pipe(startWith(0))
    ).subscribe(() => {
      this.fetchData();
    });
  }

  private async fetchData() {
    try {
      this.lastUpdateAtStr$ = of('更新时间：正在更新');
      for (const con of this.items) {
        con.message = 'loading';
        con.status = 'loading';
      }
      const obj = await firstValueFrom(this.sharedService.btcFutures());

      const updatedAt = new Date().getTime();
      this.lastUpdateAtStr$ = this.sharedService.interval(1).pipe(
        startWith(0),
        map(
          () => '更新时间：' + stringifyMills(new Date().getTime() - updatedAt)
        )
      );
      for (const con of this.items) {
        con.status = 'success';
        con.message = 'success';
        con.values = obj[con.key];
      }
    } catch (e) {
      this.notification.error(`获取btc futures失败`, `${(e as Error).message}`);
      const updatedAt = new Date().getTime();
      this.lastUpdateAtStr$ = this.sharedService.interval(1).pipe(
        startWith(0),
        map(
          () => '更新时间：' + stringifyMills(new Date().getTime() - updatedAt)
        )
      );
      for (const con of this.items) {
        con.status = 'error';
        con.message = 'error';
        con.values = [];
      }
    }
  }
}
