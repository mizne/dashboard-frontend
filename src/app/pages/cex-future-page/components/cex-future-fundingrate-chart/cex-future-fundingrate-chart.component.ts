import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as uuid from 'uuid';
import { Chart } from '@antv/g2';
import { CexFutureDaily, CexFutureDailyService, KlineIntervalService } from 'src/app/shared';
import { Observable } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';

@Component({
  selector: 'cex-future-fundingrate-chart',
  templateUrl: 'cex-future-fundingrate-chart.component.html'
})

export class CexFutureFundingrateChartComponent implements OnInit, AfterViewInit {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
  ) { }

  chart: Chart | null = null;

  chartID = 'cex-future-fundingrate-chart-wrapper-' + uuid.v4();

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
        time: format(time, 'MM-dd HH:mm'),
        type: '<=-0.05%',
        value: sortedItems.filter(e => e.time === time && e.fundingRate <= -0.0005).length
      })
      results.push({
        time: format(time, 'MM-dd HH:mm'),
        type: '(-0.05%,-0.01%]',
        value: sortedItems.filter(e => e.time === time && e.fundingRate > -0.0005 && e.fundingRate <= -0.0001).length
      })
      results.push({
        time: format(time, 'MM-dd HH:mm'),
        type: '(-0.01%,0.01%]',
        value: sortedItems.filter(e => e.time === time && e.fundingRate > -0.0001 && e.fundingRate <= 0.0001).length
      })
      results.push({
        time: format(time, 'MM-dd HH:mm'),
        type: '(0.01%,0.05%]',
        value: sortedItems.filter(e => e.time === time && e.fundingRate > 0.0001 && e.fundingRate <= 0.0005).length
      })
      results.push({
        time: format(time, 'MM-dd HH:mm'),
        type: '>0.05%',
        value: sortedItems.filter(e => e.time === time && e.fundingRate > 0.0005).length
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
      alias: '资金费率分布'
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
      .color('type', ['red', '#ef6548', 'rgb(224, 224, 224)', 'rgb(0, 109, 44)', 'rgb(0, 68, 27)']);

    chart.render();
  }
}