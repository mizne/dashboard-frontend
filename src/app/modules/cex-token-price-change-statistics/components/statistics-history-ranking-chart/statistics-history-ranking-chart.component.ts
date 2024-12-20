import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChangeService, CexTokenPriceChangeStatisticsService, KlineIntervalService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { lastValueFrom } from 'rxjs';
import { format, parse } from 'date-fns';

@Component({
  selector: 'statistics-history-ranking-chart',
  templateUrl: 'statistics-history-ranking-chart.component.html'
})
export class StatisticsHistoryRankingChartComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexTokenPriceChangeStatisticsService: CexTokenPriceChangeStatisticsService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder,
    private readonly klineIntervalService: KlineIntervalService
  ) { }



  chartDataItems: Array<{
    title: string;
    data: Array<{ label: string; value: number; group?: string; }>
  }> = []
  min = 0;
  max = 0;
  baseline: Array<any> = []
  loading = false;

  timeRanges = {
    '最近7天': [new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1e3), new Date()],
    '最近15天': [new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1e3), new Date()],
    '最近一个月': [new Date(new Date().getTime() - 1 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近三个月': [new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近半年': [new Date(new Date().getTime() - 6 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近一年': [new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1e3), new Date()],
  }
  form = this.fb.group({
    timeDateRange: [[new Date(new Date().getTime() - 6 * 30 * 24 * 60 * 60 * 1e3), new Date()]],
  });


  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadChartData()
  }

  submitForm(): void {
    this.loadChartData();
  }

  resetForm() {
    this.form.reset({
      timeDateRange: [new Date(new Date().getTime() - 6 * 30 * 24 * 60 * 60 * 1e3), new Date()]
    });

    this.loadChartData();
  }


  private async loadChartData() {
    const timeDateRange = this.form.get('timeDateRange')?.value;
    if (!(timeDateRange && timeDateRange.length === 2)) {
      this.notification.warning(`请选择时间段`, `请选择时间段`)
      return
    }

    this.loading = true;

    this.min = 0;
    this.max = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryCount({ inDays: 180 }))

    this.baseline = [
      {
        value: this.max - 10,
      },
      {
        value: this.min + 10
      }
    ]

    const items = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({
      time: {
        $lte: parse(`${format(timeDateRange[1], 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime(),
        $gte: parse(`${format(timeDateRange[0], 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime(),
      },
      inDays: {
        $in: [3, 7, 15, 30, 60, 90, 180, 360, 540]
      }
    }))



    this.loading = false;
    this.chartDataItems = [
      {
        title: '平均当前价位排行',
        data: items.map(e => {
          return {
            label: format(e.time, 'yyyy-MM-dd'),
            value: e.avgCurrentPriceRelativeRanking,
            group: `${e.inDays}天`
          }
        })
      },
      {
        title: '平均涨跌幅排行',
        data: items.map(e => {
          return {
            label: format(e.time, 'yyyy-MM-dd'),
            value: e.avgPriceChangePercentRanking,
            group: `${e.inDays}天`
          }
        })
      }
    ];
  }


}