import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Time, PriceScaleMode } from 'lightweight-charts';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexFutureDaily, CexFutureDailyService, CexFutureService, TradingViewChartTypes, TradingViewSeries } from 'src/app/shared';
import { fixTradingViewTime, avgExcludeMaxMin } from 'src/app/utils';
@Component({
  selector: 'cex-future-item-detail',
  templateUrl: 'cex-future-item-detail.component.html'
})
export class CexFutureItemDetailComponent implements OnInit {
  constructor(
    private readonly cexFutureDailyService: CexFutureDailyService,
    private readonly cexFutureService: CexFutureService,
    private readonly notification: NzNotificationService,
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  @Input() symbol = 'BTCUSDT'

  futureDetailModalVisible = false;
  futureDetailModalTitle = '';
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
    rightPriceScale: {
      mode: PriceScaleMode.Logarithmic
    }
  }

  openInterestChartOptions = {
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
    rightPriceScale: {
      mode: PriceScaleMode.Logarithmic
    }
  }

  fundingRateChartOptions = {
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

  longShortRatioChartOptions = {
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
    rightPriceScale: {
      mode: PriceScaleMode.Logarithmic
    }
  }


  priceSeries: TradingViewSeries = []
  openInterestSeries: TradingViewSeries = []
  fundingRateSeries: TradingViewSeries = []
  longShortRatioSeries: TradingViewSeries = []

  searchCtrl = new FormControl('')
  loadingChart = false;
  days = 180;
  latestCreatedAt = 0;

  markSymbols: string[] = []


  ngOnInit() {
    this.searchCtrl.valueChanges.subscribe((v) => {
      this.symbol = v as string;
      this.futureDetailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;
      this.fetchChartData();
    })

    this.fetchMarkSymbols()
  }

  open() {
    if (!this.symbol) {
      this.notification.error(`查看详情失败`, `没有symbol`)
      return
    }
    this.searchCtrl.patchValue(this.symbol, { emitEvent: false })
    this.futureDetailModalVisible = true;
    this.futureDetailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;
    this.fetchChartData()
  }

  selectMarkSymbol(symbol: string) {
    this.searchCtrl.patchValue(symbol, { emitEvent: false })
    this.symbol = symbol;
    this.futureDetailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;
    this.fetchChartData();
  }

  private fetchMarkSymbols() {
    this.cexFutureService.queryList({
      hasCollect: true
    })
      .subscribe({
        next: (items) => {
          this.markSymbols = items.map(e => e.symbol)
        }
      })
  }

  private fetchChartData() {
    this.loadingChart = true;
    this.cexFutureDailyService.queryList({
      symbol: this.symbol,
    }, { number: 1, size: this.days * 6 })
      .subscribe({
        next: (results: CexFutureDaily[]) => {
          this.loadingChart = false;
          if (results.length > 0) {
            this.latestCreatedAt = results[0].time;
          }

          this.priceSeries = [
            {
              type: TradingViewChartTypes.BASELINE,
              baselineValue: avgExcludeMaxMin(results.map(e => e.price)),
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.time - b.time)
                .map(e => ({ time: e.time, value: e.price }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]

          this.openInterestSeries = [
            {
              type: TradingViewChartTypes.BASELINE,
              baselineValue: avgExcludeMaxMin(results.map(e => e.openInterest)),
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.time - b.time)
                .map(e => ({ time: e.time, value: e.openInterest }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]

          this.fundingRateSeries = [
            {
              type: TradingViewChartTypes.BASELINE,
              baselineValue: 0.0001,
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.time - b.time)
                .map(e => ({ time: e.time, value: e.fundingRate }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]

          this.longShortRatioSeries = [
            {
              type: TradingViewChartTypes.BASELINE,
              baselineValue: 1,
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.time - b.time)
                .map(e => ({ time: e.time, value: e.longShortRatio }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]
        },
        error: (err: Error) => {
          this.loadingChart = false;
          this.notification.error(`获取${this.symbol}合约数据失败`, `${err.message}`)
        }
      })
  }
}