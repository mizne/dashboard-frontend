import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChangeService, KlineIntervalService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { lastValueFrom } from 'rxjs';
import { format, parse } from 'date-fns';

@Component({
  selector: 'price-change-chart',
  templateUrl: 'price-change-chart.component.html'
})
export class PriceChangeChartComponent implements OnInit {
  constructor(
    private readonly cexTokenPriceChangeService: CexTokenPriceChangeService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder,
    private readonly klineIntervalService: KlineIntervalService
  ) { }

  // [3, 7, 15, 30, 60, 90, 180, 360, 540];
  inDayss = [
    {
      label: '全部',
      name: ''
    },
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

  marketCaps = [
    {
      label: '全部',
      name: null
    },
    {
      label: '<=1亿',
      name: { $lte: 1e8 },
    },
    {
      label: '(1亿, 10亿]',
      name: { $gt: 1e8, $lte: 1e9, },
    },
    {
      label: '(10亿, 50亿]',
      name: { $gt: 1e9, $lte: 5 * 1e9, },
    },
    {
      label: '(50亿, 100亿]',
      name: { $gt: 5 * 1e9, $lte: 1e10, },
    },
    {
      label: '(100亿, 1000亿]',
      name: { $gt: 1e10, $lte: 1e11, },
    },
    {
      label: '>1000亿',
      name: { $gt: 1e11, },
    },
  ];

  chartDataItems: Array<{
    title: string;
    data: Array<{ label: string; value: number; color: string; }>
  }> = []
  loading = false;


  form = this.fb.group({
    tags: [],
    marketCap: [],
    time: []
  });

  submitForm(): void {
    this.loadChartData();
  }

  resetForm() {
    this.form.reset({
    });
    this.loadChartData();
  }

  ngOnInit(): void {
    this.loadChartData();
  }


  private async loadChartData() {
    this.loading = true;
    const chartDataItems: Array<{
      title: string;
      data: Array<{ label: string; value: number; color: string; }>
    }> = [];

    const formQuery = removeEmpty(this.adjustQuery(this.form.value))
    for (const inDays of this.inDayss) {
      if (inDays.name) {
        const items = await lastValueFrom(this.cexTokenPriceChangeService.queryList({
          inDays: inDays.name,
          ...(formQuery)
        }))
        const chartData = {
          title: `${inDays.name} 天`,
          data: [
            {
              label: '跌 >=90%',
              value: items.filter(e => e.priceChangePercent <= -0.9).length,
              color: '#7C0902'
            },
            {
              label: '跌 [50%,90%)',
              value: items.filter(e => e.priceChangePercent > -0.9 && e.priceChangePercent <= -0.5).length,
              color: '#AB274F'
            },
            {
              label: '跌 [20%,50%)',
              value: items.filter(e => e.priceChangePercent > -0.5 && e.priceChangePercent <= -0.2).length,
              color: '#FE6F5E'
            },
            {
              label: '跌 [0,20%)',
              value: items.filter(e => e.priceChangePercent > -0.2 && e.priceChangePercent <= 0).length,
              color: '#FDBCB4'
            },
            {
              label: '涨 (0,100%]',
              value: items.filter(e => e.priceChangePercent > 0 && e.priceChangePercent <= 1.0).length,
              color: '#ACE1AF'
            },
            {
              label: '涨 (100%,500%]',
              value: items.filter(e => e.priceChangePercent > 1.0 && e.priceChangePercent <= 5.0).length,
              color: '#50C878'
            },
            {
              label: '涨 (500%,1000%]',
              value: items.filter(e => e.priceChangePercent > 5.0 && e.priceChangePercent <= 10.0).length,
              color: '#177245'
            },
            {
              label: '涨 >1000%',
              value: items.filter(e => e.priceChangePercent > 10.0).length,
              color: '#013220'
            }
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



  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // MARK: 
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'time' && query['time']) {
        const adjustTime = parse(`${format(query['time'], 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime()
        const time = Math.min(adjustTime, this.klineIntervalService.resolveOneDayIntervalMills(1));
        Object.assign(o, {
          time: time
        })
        if (adjustTime !== time) {
          this.notification.warning(`选择的快照时间超出最新时间`, `获取最新时间的数据`)
        }
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }




}