import { Component, OnInit } from '@angular/core';
import { CexFutureDaily, CexFutureDailyService, KlineIntervalService } from 'src/app/shared';
import { Observable } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';

@Component({
  selector: 'cex-future-fundingrate-chart',
  templateUrl: 'cex-future-fundingrate-chart.component.html'
})

export class CexFutureFundingrateChartComponent implements OnInit {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
  ) { }

  title = '资金费率分布';
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = []

  ngOnInit() {
    const intervals = 5 * 6;
    this.fetchData(intervals)
      .subscribe({
        next: (items: CexFutureDaily[]) => {
          this.data = this.convertData(items);
          this.colors = ['rgb(203, 24, 29)', 'rgb(252, 187, 161)', 'rgb(224, 224, 224)', 'rgb(199, 233, 192)', 'rgb(35, 139, 69)']
        },
        error: (err: Error) => {
          this.notification.error(`获取资金费率合约数据失败`, `${err.message}`)
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
    for (const time of times) {
      results.push({
        time: format(time, 'dd HH:mm'),
        type: '<=-0.05%',
        value: sortedItems.filter(e => e.time === time && e.fundingRate <= -0.0005).length
      })
      results.push({
        time: format(time, 'dd HH:mm'),
        type: '(-0.05%,-0.01%]',
        value: sortedItems.filter(e => e.time === time && e.fundingRate > -0.0005 && e.fundingRate <= -0.0001).length
      })
      results.push({
        time: format(time, 'dd HH:mm'),
        type: '(-0.01%,0.01%]',
        value: sortedItems.filter(e => e.time === time && e.fundingRate > -0.0001 && e.fundingRate <= 0.0001).length
      })
      results.push({
        time: format(time, 'dd HH:mm'),
        type: '(0.01%,0.05%]',
        value: sortedItems.filter(e => e.time === time && e.fundingRate > 0.0001 && e.fundingRate <= 0.0005).length
      })
      results.push({
        time: format(time, 'dd HH:mm'),
        type: '>0.05%',
        value: sortedItems.filter(e => e.time === time && e.fundingRate > 0.0005).length
      })
    }

    return results
  }
}