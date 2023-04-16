import { Component, OnInit } from '@angular/core';
import { CexFutureDaily, CexFutureDailyService, KlineIntervalService, Legend, filterLegendType, normalizeLegendType } from 'src/app/shared';
import { Observable } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';

@Component({
  selector: 'cex-future-longshort-chart',
  templateUrl: 'cex-future-longshort-chart.component.html'
})

export class CexFutureLongshortChartComponent implements OnInit {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
  ) { }

  title = '多空比分布';
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = []

  legends: Array<Legend> = [
    {
      type: {
        lte: 0.85
      },
      color: 'rgb(203, 24, 29)'
    },
    {
      type: {
        gt: 0.85,
        lte: 1.0
      },
      color: 'rgb(252, 187, 161)'
    },
    {
      type: {
        gt: 1.0,
        lte: 2.5
      },
      color: 'rgb(199, 233, 192)'
    },
    {
      type: {
        gt: 2.5,
      },
      color: 'rgb(35, 139, 69)'
    },
  ]

  ngOnInit() {
    const intervals = 5 * 6;
    this.fetchData(intervals)
      .subscribe({
        next: (items: CexFutureDaily[]) => {
          this.data = this.convertData(items);
          this.colors = this.legends.map(e => e.color);
        },
        error: (err: Error) => {
          this.notification.error(`获取多空比合约数据失败`, `${err.message}`)
        }
      })
  }

  private fetchData(intervals: number): Observable<CexFutureDaily[]> {
    const time = this.klineInterval.resolveFourHoursIntervalMills(intervals);

    return this.cexFutureDailyService.queryList({
      time: {
        $gte: time
      }
    })
  }

  private convertData(items: CexFutureDaily[]): Array<{
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
          value: sortedItems.filter(e => e.time === time && legendPre.predicate(e.longShortRatio)).length
        })
      }
    }
    return results
  }

}