import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CexTokenDaily, CexTokenDailyService, KlineIntervalService, KlineIntervals, tokenTagNameOfTotalMarket } from 'src/app/shared';
import { Observable } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';
import { resolvePriceStatus } from 'src/app/utils';

@Component({
  selector: 'cex-token-price-status-chart',
  templateUrl: 'cex-token-price-status-chart.component.html'
})

export class CexTokenPriceStatusChartComponent implements OnInit, OnChanges {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexTokenDailyService: CexTokenDailyService,
    private readonly notification: NzNotificationService,
  ) { }

  @Input() tag: string = '';
  @Input() interval: KlineIntervals = KlineIntervals.FOUR_HOURS

  title = '价格形态分布';
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = []

  loading = false;

  ngOnInit() {
    // this.loadData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadData();
  }

  private loadData() {
    this.loading = true;
    const intervals = 6 * 6;
    this.fetchData(intervals)
      .subscribe({
        next: (items: CexTokenDaily[]) => {
          this.loading = false;
          this.data = this.convertData(items);
          this.colors = [
            'rgb(203, 24, 29)',
            'rgb(224, 224, 224)',
            'rgb(35, 139, 69)'
          ]
        },
        error: (err: Error) => {
          this.loading = false;
          this.notification.error(`获取价格形态数据失败`, `${err.message}`)
        }
      })
  }

  private fetchData(intervals: number): Observable<CexTokenDaily[]> {
    const time = this.resolveTime(intervals);

    return this.cexTokenDailyService.queryList({
      time: {
        $gte: time
      },
      interval: this.interval,
      ...(this.tag === tokenTagNameOfTotalMarket ? {} : {
        tags: this.tag
      })
    })
  }

  private resolveTime(intervals: number): number {
    switch (this.interval) {
      case KlineIntervals.FOUR_HOURS:
        return this.klineInterval.resolveFourHoursIntervalMills(intervals);
      case KlineIntervals.ONE_DAY:
        return this.klineInterval.resolveOneDayIntervalMills(intervals);
      default:
        this.notification.error(`未知 kline时间周期`, `CexTokenPriceStatusChartComponent resolveTime() 未知interval: ${this.interval}`)
        return this.klineInterval.resolveFourHoursIntervalMills(intervals);
    }
  }

  private convertData(items: CexTokenDaily[]): Array<{
    time: string;
    type: string;
    value: number;
  }> {
    const sortedItems = items.sort((a, b) => a.time - b.time);
    const times = Array.from(new Set(sortedItems.map(e => e.time)));

    const results: Array<{
      time: string;
      type: string;
      value: number;
    }> = []

    for (const time of times) {
      results.push({
        time: format(time, 'dd HH:mm'),
        type: 'short',
        value: sortedItems.filter(e => e.time === time && resolvePriceStatus(e.closeDeltaEma21, e.ema21DeltaEma55, e.ema55DeltaEma144) === 'short').length
      })

      results.push({
        time: format(time, 'dd HH:mm'),
        type: 'shock',
        value: sortedItems.filter(e => e.time === time && resolvePriceStatus(e.closeDeltaEma21, e.ema21DeltaEma55, e.ema55DeltaEma144) === 'shock').length
      })

      results.push({
        time: format(time, 'dd HH:mm'),
        type: 'long',
        value: sortedItems.filter(e => e.time === time && resolvePriceStatus(e.closeDeltaEma21, e.ema21DeltaEma55, e.ema55DeltaEma144) === 'long').length
      })
    }
    return results
  }

}