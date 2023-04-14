import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as uuid from 'uuid';
import { Chart } from '@antv/g2';
import { CexFutureDaily, CexFutureDailyService, KlineIntervalService } from 'src/app/shared';
import { Observable } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';

@Component({
  selector: 'cex-future-longshort-chart',
  templateUrl: 'cex-future-longshort-chart.component.html'
})

export class CexFutureLongshortChartComponent implements OnInit, AfterViewInit {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
  ) { }

  chart: Chart | null = null;

  chartID = 'cex-future-longshort-chart-wrapper-' + uuid.v4();

  height = 200

  ngOnInit() { }

  ngAfterViewInit(): void {
    const chart = new Chart({
      container: this.chartID,
      theme: 'classic',
      autoFit: true,
    });

    this.chart = chart;

    const intervals = 5 * 6;
    this.fetchData(intervals)
      .subscribe({
        next: (items: CexFutureDaily[]) => {
          this.renderChart(chart, this.convertData(items))
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
    for (const time of times) {
      results.push({
        time: format(time, 'dd HH:mm'),
        type: '<=0.7',
        value: sortedItems.filter(e => e.time === time && e.longShortRatio <= 0.7).length
      })
      results.push({
        time: format(time, 'dd HH:mm'),
        type: '(0.7,1.0]',
        value: sortedItems.filter(e => e.time === time && e.longShortRatio > 0.7 && e.longShortRatio <= 1.0).length
      })
      results.push({
        time: format(time, 'dd HH:mm'),
        type: '(1.0,2.0]',
        value: sortedItems.filter(e => e.time === time && e.longShortRatio > 1.0 && e.longShortRatio <= 2.0).length
      })
      results.push({
        time: format(time, 'dd HH:mm'),
        type: '>2.0',
        value: sortedItems.filter(e => e.time === time && e.longShortRatio > 2.0).length
      })
    }

    return results
  }

  private renderChart(chart: Chart, data: Array<{
    time: string;
    type: string;
    value: number
  }>) {


    chart.data(data);
    chart.scale('value', {
      alias: '多空比分布'
    });
    chart.axis('time', {
      tickLine: null,
    });

    chart.axis('value', {
      label: {
        formatter: text => {
          return text.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
        }
      },
      title: {
        offset: 80,
        style: {
          fill: '#aaaaaa'
        },
      }
    });
    chart.legend({
      position: 'top',
    });

    chart.tooltip({
      shared: true,
      showMarkers: false,
    });
    chart.interaction('active-region');

    chart
      .interval()
      .adjust('stack')
      .position('time*value')
      .color('type', ['rgb(203, 24, 29)', 'rgb(252, 187, 161)', 'rgb(199, 233, 192)', 'rgb(35, 139, 69)']);

    chart.render();
  }
}