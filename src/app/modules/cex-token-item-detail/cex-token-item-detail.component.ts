import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Time, PriceScaleMode } from 'lightweight-charts';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexToken, CexTokenDaily, CexTokenDailyService, CexTokenService, KlineIntervalService, KlineIntervals, TradingViewChartTypes, TradingViewSeries } from 'src/app/shared';
import { fixTradingViewTime } from 'src/app/utils';
import { avgExcludeMaxMin } from 'handy-toolkit'
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'cex-token-item-detail',
  templateUrl: 'cex-token-item-detail.component.html'
})
export class CexTokenItemDetailComponent implements OnInit {
  constructor(
    private readonly cexTokenDailyService: CexTokenDailyService,
    private readonly cexTokenService: CexTokenService,
    private readonly notification: NzNotificationService,
    private readonly klineIntervalService: KlineIntervalService,
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  @Input() symbol = 'BTCUSDT'

  detailModalVisible = false;
  detailModalTitle = '';

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
  volumeChartOptions = {
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
  priceSeries: TradingViewSeries = []

  volumeSeries: TradingViewSeries = []

  interval = KlineIntervals.FOUR_HOURS;
  time = this.klineIntervalService.resolveFourHoursIntervalMills(1)

  hasCollectCtrl = new FormControl(false)

  searchCtrl = new FormControl('')
  loadingChart = false;
  days = 180;
  latestCreatedAt = 0;

  markSymbols: string[] = []

  cexTokenAlertSelectCtrl = new FormControl('')

  ngOnInit() {
    this.listenSearchChange();
    this.listenHasCollectCtrlChange();
    this.listenCexTokenAlertSelectChange();
  }

  open() {
    if (!this.symbol) {
      this.notification.error(`查看详情失败`, `没有symbol`)
      return
    }
    this.searchCtrl.patchValue(this.symbol, { emitEvent: false })
    this.cexTokenAlertSelectCtrl.patchValue(this.symbol, { emitEvent: false })
    this.detailModalVisible = true;
    this.detailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;
    this.fetchMarkSymbols()
    this.fetchChartData()
    this.patchHasCollectCtrl();
  }

  selectMarkSymbol(symbol: string) {
    this.searchCtrl.patchValue(symbol, { emitEvent: false })
    this.cexTokenAlertSelectCtrl.patchValue(symbol, { emitEvent: false })
    this.symbol = symbol;
    this.detailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;
    this.fetchChartData();
    this.patchHasCollectCtrl();
  }

  private async patchHasCollectCtrl() {
    const item = await this.fetchCexTokenBySymbol();
    if (item) {
      this.hasCollectCtrl.patchValue(!!item.hasCollect, { emitEvent: false })
    }
  }

  private listenSearchChange() {
    this.searchCtrl.valueChanges.subscribe((v) => {
      this.symbol = v as string;
      this.detailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;

      this.cexTokenAlertSelectCtrl.patchValue(v, { emitEvent: false })
      this.fetchChartData();
      this.patchHasCollectCtrl();
    })
  }

  private listenHasCollectCtrlChange() {
    this.hasCollectCtrl.valueChanges.subscribe(async (hasCollect) => {
      const item = await this.fetchCexTokenBySymbol();
      if (item) {
        this.cexTokenService.update(item._id, { hasCollect: !!hasCollect })
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

  private listenCexTokenAlertSelectChange() {
    this.cexTokenAlertSelectCtrl.valueChanges.subscribe((v) => {
      this.symbol = v as string;
      this.detailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;

      this.searchCtrl.patchValue(v, { emitEvent: false })
      this.fetchChartData();
      this.patchHasCollectCtrl();
    })
  }

  private async fetchCexTokenBySymbol(): Promise<CexToken | null> {
    const items = await lastValueFrom(this.cexTokenService.queryList({ symbol: this.symbol }))
    if ((items).length === 1) {
      return items[0]
    } else if (items.length >= 2) {
      console.log(`[CexTokenItemDetailComponent] found ${items.length} cex token items by symbol: ${this.symbol}`)
      this.notification.warning(`获取${this.symbol} 多个CexToken`, `有可疑数据`)
      return items[0]
    } else {
      console.log(`[CexTokenItemDetailComponent] not found cex token item by symbol: ${this.symbol}`)
      this.notification.error(`获取${this.symbol}详情失败`, `未找到`)
      return null
    }
  }

  private fetchMarkSymbols() {
    this.cexTokenService.queryList({
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
    this.cexTokenDailyService.queryList({
      symbol: this.symbol,
      interval: this.interval
    }, { number: 1, size: this.days * 6 })
      .subscribe({
        next: (results: CexTokenDaily[]) => {
          if (results.length > 0) {
            this.latestCreatedAt = results[0].time;
          }
          this.loadingChart = false;
          const validResults = this.markInvalidResults(results)
          this.priceSeries = [
            {
              type: TradingViewChartTypes.BASELINE,
              baselineValue: avgExcludeMaxMin(validResults.map(e => e.price)),
              color: '#f6bf26',
              data: validResults
                .map(e => ({ time: e.time, value: e.price }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]

          this.volumeSeries = [
            {
              type: TradingViewChartTypes.HISTOGRAM,
              color: '#22ab94',
              data: validResults
                .map(e => ({ time: e.time, value: e.volume }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]
        },
        error: (err: Error) => {
          this.loadingChart = false;
          this.notification.error(`获取${this.symbol}现货数据失败`, `${err.message}`)
        }
      })
  }

  private markInvalidResults(results: CexTokenDaily[]): CexTokenDaily[] {
    const validResults = results.filter(e => typeof e.price === 'number' && typeof e.volume === 'number')

    if (validResults.length < results.length) {
      console.log(`markInvalidResults() ${results[0].symbol} 'price' 'volume' must be number, invalid results count: ${results.length - validResults.length}`)
    }

    const res: CexTokenDaily[] = []

    for (const e of validResults.sort((a, b) => a.time - b.time)) {
      const the = res.find(f => f.time === e.time);
      if (!the) {
        res.push(e)
      } else {
        console.log(`markInvalidResults() ${results[0].symbol} find same time cex token daily, `, e, the)
        continue
      }
    }

    return res;
  }
}