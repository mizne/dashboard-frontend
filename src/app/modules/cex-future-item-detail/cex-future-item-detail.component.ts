import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { Time } from 'lightweight-charts';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexFutureDaily, CexFutureDailyService } from 'src/app/shared';
import { fixTradingViewTime } from 'src/app/utils';
@Component({
  selector: 'cex-future-item-detail',
  templateUrl: 'cex-future-item-detail.component.html'
})
export class CexFutureItemDetailComponent implements OnInit {
  constructor(
    private readonly cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  @Input() symbol = ''

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

  priceChartOptions = {
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
        return `${(n).toFixed(2)}`
      },
    },
  }
  priceSeries: Array<{
    type: string;
    color: string;
    data: { time: Time; value: number }[];
  }> = []
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

  ngOnInit() { }

  open() {
    if (!this.symbol) {
      this.notification.error(`查看详情失败`, `没有symbol`)
      return
    }
    const days = 180;
    this.cexFutureDailyService.queryList({
      symbol: this.symbol,
    }, { number: 1, size: days * 6 })
      .subscribe({
        next: (results: CexFutureDaily[]) => {
          this.futureDetailModalVisible = true;
          this.futureDetailModalTitle = `${this.symbol} 近 ${days} 天数据`;

          this.priceSeries = [
            {
              type: 'line',
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.time - b.time)
                .map(e => ({ time: e.time, value: e.price }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]

          this.openInterestSeries = [
            {
              type: 'line',
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.time - b.time)
                .map(e => ({ time: e.time, value: e.openInterest }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]

          this.fundingRateSeries = [
            {
              type: 'line',
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.time - b.time)
                .map(e => ({ time: e.time, value: e.fundingRate }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]

          this.longShortRatioSeries = [
            {
              type: 'line',
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.time - b.time)
                .map(e => ({ time: e.time, value: e.longShortRatio }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]
        },
        error: (err: Error) => {
          this.notification.error(`获取${this.symbol}合约数据失败`, `${err.message}`)
        }
      })
  }
}