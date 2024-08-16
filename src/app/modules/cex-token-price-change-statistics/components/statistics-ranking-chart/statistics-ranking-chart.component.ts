import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChangeService, CexTokenPriceChangeStatisticsService, KlineIntervalService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { lastValueFrom } from 'rxjs';
import { format, parse } from 'date-fns';

@Component({
  selector: 'statistics-ranking-chart',
  templateUrl: 'statistics-ranking-chart.component.html'
})
export class StatisticsRankingChartComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexTokenPriceChangeStatisticsService: CexTokenPriceChangeStatisticsService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder,
    private readonly klineIntervalService: KlineIntervalService
  ) { }

  // [3, 7, 15, 30, 60, 90, 180, 360, 540];
  inDayss = [
    {
      label: '3',
      name: 3,
    },
    {
      label: '7',
      name: 7,
    },
    {
      label: '15',
      name: 15,
    },
    {
      label: '30',
      name: 30,
    },
    {
      label: '60',
      name: 60,
    },
    {
      label: '90',
      name: 90,
    },
    {
      label: '180',
      name: 180,
    },
    {
      label: '360',
      name: 360,
    },
    {
      label: '540',
      name: 540,
    },
  ];

  @Input() time: number | Date | null | undefined = 0;


  chartDataItems: Array<{
    title: string;
    data: Array<{ label: string; value: number; color?: string; text?: string; textOffsetY?: number; textColor?: string; }>
  }> = []
  baseline: any = null
  loading = false;


  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadChartData()
  }


  private async loadChartData() {
    if (!this.time) {

      return
    }

    this.loading = true;
    const chartDataItems: Array<{
      title: string;
      data: Array<{ label: string; value: number; color?: string; text?: string; textOffsetY?: number; textColor?: string; }>
    }> = [];

    for (const inDays of this.inDayss) {
      const totalCount = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryCount({ inDays: inDays.name }))
      if (inDays.name) {
        const items = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({
          inDays: inDays.name,
          time: parse(`${format(this.time, 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime()
        }))
        const avgPriceRelativeText = this.resolveText(items[0].avgCurrentPriceRelativeRanking, totalCount);
        const avgPricePercentText = this.resolveText(items[0].avgPriceChangePercentRanking, totalCount);
        const chartData = {
          title: `${inDays.name} 天`,
          data: [
            {
              label: '平均当前价位',
              value: items[0].avgCurrentPriceRelativeRanking,
              ...(avgPriceRelativeText ? {
                text: avgPriceRelativeText,
                ...(avgPriceRelativeText.indexOf('低') >= 0 ? {
                  textOffsetY: -10
                } : {
                  textOffsetY: 30,
                  textColor: '#FFFF66'
                })
              } : {}),
              color: this.resolveColor(items[0].avgCurrentPriceRelativeRanking, totalCount)
            },
            {
              label: '平均涨跌幅',
              value: items[0].avgPriceChangePercentRanking,
              ...(avgPricePercentText ? {
                text: avgPricePercentText,
                ...(avgPricePercentText.indexOf('低') >= 0 ? {
                  textOffsetY: -10
                } : {
                  textOffsetY: 30,
                  textColor: '#FFFF66'
                })
              } : {}),
              color: this.resolveColor(items[0].avgPriceChangePercentRanking, totalCount)
            },
            {
              label: '总数',
              value: totalCount,
              color: '#063d8a'
            },

          ].filter(e => e.value > 0)
        }

        if (chartData.data.length > 0) {
          chartDataItems.push(chartData)
        }
      }

    }

    this.loading = false;
    this.chartDataItems = chartDataItems;
  }

  private resolveText(n: number, total: number): string {
    if (n <= 10) {
      return n === 1 ? '历史最低' : `历史第${n}低`
    }

    if (n >= total - 9) {
      return n === total ? '历史最高' : `历史第${total - n + 1}高`
    }

    return ''
  }


  private resolveColor(n: number, total: number): string {
    if (n >= total * 0.95) {
      return '#013220'
    }
    if (n <= total * 0.05) {
      return '#FE6F5E'
    }
    return '#13479070'
  }
}