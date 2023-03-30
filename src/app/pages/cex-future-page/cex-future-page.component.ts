import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Time } from 'lightweight-charts';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CexFutureService, CexFutureDailyService, CexFuture, CexFutureDaily, NotifyObserverTypes } from 'src/app/shared';
import { fixTradingViewTime, removeNullOrUndefined } from 'src/app/utils';

@Component({
  selector: 'app-cex-future-page',
  templateUrl: './cex-future-page.component.html',
  styleUrls: ['./cex-future-page.component.less'],
})
export class CexFuturePageComponent implements OnInit {
  constructor(
    private readonly cexFutureService: CexFutureService,
    private readonly cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
  ) { }

  total = 1;
  items: CexFuture[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form: FormGroup<any> = this.fb.group({
    symbol: [null],
  });
  marketType = NotifyObserverTypes.MARKET

  futureDetailModalVisible = false;
  futureDetailModalTitle = '';
  chartOptions = {
    localization: {
      priceFormatter: (n: number) => {
        if (n >= 1e9) {
          return `${(n / 1e9).toFixed(2)} B`
        }
        if (n >= 1e6) {
          return `${(n / 1e6).toFixed(2)} M`
        }
        if (n >= 1e3) {
          return `${(n / 1e3).toFixed(2)} K`
        }
        if (n >= 1) {
          return `${(n).toFixed(2)}`
        }
        return `${(n * 100).toFixed(2)} %`
      },
    },
  }
  openInterestSeries: Array<{
    type: string;
    color: string;
    data: { time: Time; value: number }[];
  }> = []
  fundingRateSeries: Array<{
    type: string;
    color: string;
    data: { time: Time; value: number }[];
  }> = []
  longShortRatioSeries: Array<{
    type: string;
    color: string;
    data: { time: Time; value: number }[];
  }> = []

  submitForm(): void {
    this.query = removeNullOrUndefined(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset();
    this.query = removeNullOrUndefined(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();
  }



  confirmView(item: CexFuture) {
    this.cexFutureDailyService.queryList({
      symbol: item.symbol,
    }, { number: 1, size: 180 })
      .subscribe({
        next: (results: CexFutureDaily[]) => {
          this.futureDetailModalVisible = true;
          this.futureDetailModalTitle = `${item.symbol} 近30天数据`;

          this.openInterestSeries = [
            {
              type: 'line',
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.createdAt - b.createdAt)
                .map(e => ({ createdAt: e.time, value: e.openInterest }))
                .map(e => ({ time: fixTradingViewTime(e.createdAt), value: e.value }))
            }
          ]

          this.fundingRateSeries = [
            {
              type: 'line',
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.createdAt - b.createdAt)
                .map(e => ({ createdAt: e.time, value: e.fundingRate }))
                .map(e => ({ time: fixTradingViewTime(e.createdAt), value: e.value }))
            }
          ]

          this.longShortRatioSeries = [
            {
              type: 'line',
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.createdAt - b.createdAt)
                .map(e => ({ createdAt: e.time, value: e.longShortRatio }))
                .map(e => ({ time: fixTradingViewTime(e.createdAt), value: e.value }))
            }
          ]
        },
        error: (err: Error) => {
          this.notification.error(`获取${item.symbol}合约数据失败`, `${err.message}`)
        }
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sort = this.buildSort(sortField, sortOrder);
    this.loadDataFromServer();
  }



  private loadDataFromServer(): void {
    this.loading = true;
    this.cexFutureService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map(e => ({
          ...e,
        }));
      });

    this.cexFutureService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }



  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // symbol 支持正则查询
    const o: { [key: string]: any } = {
    };
    Object.keys(query).forEach((key) => {
      if (key === 'symbol') {
        Object.assign(o, {
          ['symbol']: { $regex: query['symbol'].trim(), $options: 'i' },
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }

  private buildSort(sortField?: string | null, sortOrder?: string | null) {
    if (!sortField) {
      return {
        createdAt: 1,
      };
    }

    if (sortField === 'createdAtStr') {
      if (sortOrder === 'ascend') {
        return {
          [sortField.slice(0, -3)]: 1,
        };
      }
      if (sortOrder === 'descend') {
        return {
          [sortField.slice(0, -3)]: -1,
        };
      }
    }

    return sortOrder === 'ascend'
      ? { [sortField]: 1 }
      : sortOrder === 'descend'
        ? { [sortField]: -1 }
        : {
          createdAt: -1,
        };
  }
}
