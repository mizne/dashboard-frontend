import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Time, PriceScaleMode } from 'lightweight-charts';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexFuture, CexFutureDaily, CexFutureDailyService, CexFutureService, TradingViewChartTypes, TradingViewSeries } from 'src/app/shared';
import { fixTradingViewTime } from 'src/app/utils';
import { avgExcludeMaxMin } from 'handy-toolkit'
import { lastValueFrom } from 'rxjs';

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

  hasCollectCtrl = new FormControl(false)

  searchCtrl = new FormControl('')
  loadingChart = false;
  days = 180;
  latestCreatedAt = 0;

  markSymbols: string[] = []

  cexFutureAlertSelectCtrl = new FormControl('')

  ngOnInit() {


    this.fetchMarkSymbols()

    this.listenSearchChange();
    this.listenHasCollectCtrlChange();

    this.listenCexFutureAlertSelectChange();
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
    this.patchHasCollectCtrl();
  }

  selectMarkSymbol(symbol: string) {
    this.searchCtrl.patchValue(symbol, { emitEvent: false })
    this.cexFutureAlertSelectCtrl.patchValue(symbol, { emitEvent: false })
    this.symbol = symbol;
    this.futureDetailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;
    this.fetchChartData();
    this.patchHasCollectCtrl();
  }

  private async patchHasCollectCtrl() {
    const item = await this.fetchCexFutureBySymbol();
    if (item) {
      this.hasCollectCtrl.patchValue(item.hasCollect, { emitEvent: false })
    }
  }

  private listenSearchChange() {
    this.searchCtrl.valueChanges.subscribe((symbol) => {
      this.symbol = symbol as string;
      this.futureDetailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;

      this.cexFutureAlertSelectCtrl.patchValue(this.symbol, { emitEvent: false })

      this.fetchChartData();
      this.patchHasCollectCtrl();
    })
  }

  private listenHasCollectCtrlChange() {
    this.hasCollectCtrl.valueChanges.subscribe(async (hasCollect) => {
      const item = await this.fetchCexFutureBySymbol();
      if (item) {
        this.cexFutureService.update(item._id, { hasCollect: !!hasCollect })
          .subscribe({
            next: () => {
              this.notification.success(`${hasCollect ? '标记' : '取消标记'} ${this.symbol} 成功`, `${hasCollect ? '标记' : '取消标记'} ${this.symbol} 成功`)
              this.fetchMarkSymbols()
            },
            error: (err) => {
              this.notification.error(`${hasCollect ? '标记' : '取消标记'} ${this.symbol} 失败`, `${err.message}`)
              this.hasCollectCtrl.patchValue(!hasCollect, { emitEvent: false })
            }
          })
      }
    })
  }

  private listenCexFutureAlertSelectChange() {
    this.cexFutureAlertSelectCtrl.valueChanges.subscribe(symbol => {
      this.symbol = symbol as string;
      this.futureDetailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;

      this.searchCtrl.patchValue(this.symbol, { emitEvent: false })

      this.fetchChartData();
      this.patchHasCollectCtrl();
    })
  }

  private async fetchCexFutureBySymbol(): Promise<CexFuture | null> {
    const items = await lastValueFrom(this.cexFutureService.queryList({ symbol: this.symbol }))
    if ((items).length === 1) {
      return items[0]
    } else if (items.length >= 2) {
      console.log(`[CexFutureItemDetailComponent] found ${items.length} cex future items by symbol: ${this.symbol}`)
      this.notification.warning(`获取${this.symbol} 多个CexFuture`, `有可疑数据`)
      return items[0]
    } else {
      console.log(`[CexFutureItemDetailComponent] not found cex future item by symbol: ${this.symbol}`)
      this.notification.error(`获取${this.symbol}详情失败`, `未找到`)
      return null
    }
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
              baselineValue: avgExcludeMaxMin(results.filter(e => typeof e.price === 'number').map(e => e.price)),
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