import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CexTokenDaily, CexTokenDailyService, KlineIntervalService, KlineIntervals, filterLegendType, normalizeLegendType, tokenTagNameOfTotalMarket } from 'src/app/shared';
import { Observable } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';
import { Legend } from 'src/app/shared';



@Component({
  selector: 'cex-token-big-volume-chart',
  templateUrl: 'cex-token-big-volume-chart.component.html'
})

export class CexTokenBigVolumeChartComponent implements OnInit, OnChanges {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexTokenDailyService: CexTokenDailyService,
    private readonly notification: NzNotificationService,
  ) { }

  @Input() tag: string = '';
  @Input() interval: KlineIntervals = KlineIntervals.FOUR_HOURS

  title = '交易量暴增分布';
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = [];

  legends: Array<Legend> = [
    {
      type: {
        lte: 0.8
      },
      color: 'rgb(247, 251, 255)'
    },
    {
      type: {
        gt: 0.8,
        lte: 1
      },
      color: 'rgb(198, 219, 239)'
    },
    {
      type: {
        gt: 1,
        lte: 3
      },
      color: 'rgb(107, 174, 214)'
    },
    {
      type: {
        gt: 3,
        lte: 10
      },
      color: 'rgb(33, 113, 181)'
    },
    {
      type: {
        gt: 10,
      },
      color: 'rgb(8, 48, 107)'
    }
  ]

  loading = false;

  ngOnInit() {
    // this.loadData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadData()
  }

  private loadData() {
    this.loading = true;
    const intervals = 5 * 6;
    this.fetchData(intervals)
      .subscribe({
        next: (items: CexTokenDaily[]) => {
          this.loading = false;
          this.data = this.convertData(items);
          this.colors = this.legends.map(e => e.color);
        },
        error: (err: Error) => {
          this.loading = false;
          this.notification.error(`获取交易量暴增数据失败`, `${err.message}`)
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
        this.notification.error(`未知 kline时间周期`, `CexTokenBigVolumeChartComponent resolveTime() 未知interval: ${this.interval}`)
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

    const legendPres = this.legends.map(e => {
      return {
        type: normalizeLegendType(e),
        predicate: filterLegendType(e)
      }
    })

    for (const time of times) {
      for (const legendPre of legendPres) {
        results.push({
          time: format(time, 'dd HH:mm'),
          type: legendPre.type,
          value: sortedItems.filter(e => e.time === time && legendPre.predicate(e.volumeMultiple)).length
        })
      }
    }
    return results
  }
}