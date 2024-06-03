import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Time } from 'lightweight-charts';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenDaily, CexTokenDailyService, KlineIntervalService, KlineIntervals, TradingViewChartTypes } from 'src/app/shared';
import { fixTradingViewTime } from 'src/app/utils';
@Component({
  selector: 'cex-token-item-detail',
  templateUrl: 'cex-token-item-detail.component.html'
})
export class CexTokenItemDetailComponent implements OnInit {
  constructor(
    private readonly cexTokenDailyService: CexTokenDailyService,
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
  }
  priceSeries: Array<{
    type: TradingViewChartTypes;
    color: string;
    data: { time: Time; value: number }[];
  }> = []

  volumeSeries: Array<{
    type: TradingViewChartTypes;
    color: string;
    data: { time: Time; value: number }[];
  }> = []

  interval = KlineIntervals.FOUR_HOURS;
  time = this.klineIntervalService.resolveFourHoursIntervalMills(1)

  searchCtrl = new FormControl('')
  loadingChart = false;
  days = 180;

  ngOnInit() {
    this.searchCtrl.valueChanges.subscribe((v) => {
      this.symbol = v as string;
      this.detailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;
      this.fetchChartData();
    })
  }

  open() {
    if (!this.symbol) {
      this.notification.error(`查看详情失败`, `没有symbol`)
      return
    }
    this.searchCtrl.patchValue(this.symbol, { emitEvent: false })
    this.detailModalVisible = true;
    this.detailModalTitle = `${this.symbol} 近 ${this.days} 天数据`;
    this.fetchChartData()
  }

  private fetchChartData() {
    this.loadingChart = true;
    this.cexTokenDailyService.queryList({
      symbol: this.symbol,
      interval: this.interval
    }, { number: 1, size: this.days * 6 })
      .subscribe({
        next: (results: CexTokenDaily[]) => {
          this.loadingChart = false;
          this.priceSeries = [
            {
              type: TradingViewChartTypes.LINE,
              color: '#f6bf26',
              data: results
                .sort((a, b) => a.time - b.time)
                .map(e => ({ time: e.time, value: e.price }))
                .map(e => ({ time: fixTradingViewTime(e.time), value: e.value }))
            }
          ]

          this.volumeSeries = [
            {
              type: TradingViewChartTypes.HISTOGRAM,
              color: '#22ab94',
              data: results
                .sort((a, b) => a.time - b.time)
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
}