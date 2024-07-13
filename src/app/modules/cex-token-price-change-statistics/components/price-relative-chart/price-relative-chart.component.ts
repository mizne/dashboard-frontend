import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChangeService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'price-relative-chart',
  templateUrl: 'price-relative-chart.component.html'
})
export class PriceRelativeChartComponent implements OnInit {
  constructor(
    private readonly cexTokenPriceChangeService: CexTokenPriceChangeService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder
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
  loading = false


  form = this.fb.group({
    tags: [],
    marketCap: []
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

    for (const inDays of this.inDayss) {
      if (inDays.name) {
        const items = await lastValueFrom(this.cexTokenPriceChangeService.queryList({
          inDays: inDays.name,
          ...(removeEmpty(this.adjustQuery(this.form.value)))
        }))
        const chartData = {
          title: `${inDays.name} 天`,
          data: [
            {
              label: '[0, 0.2)',
              value: items.filter(e => e.currentPriceRelative >= 0 && e.currentPriceRelative < 0.2).length,
              color: '#7C0902'
            },
            {
              label: '[0.2, 0.4)',
              value: items.filter(e => e.currentPriceRelative >= 0.2 && e.currentPriceRelative < 0.4).length,
              color: '#AB274F'
            },

            {
              label: '[0.4, 0.6)',
              value: items.filter(e => e.currentPriceRelative >= 0.4 && e.currentPriceRelative < 0.6).length,
              color: '#50C878'
            },
            {
              label: '[0.6, 0.8)',
              value: items.filter(e => e.currentPriceRelative >= 0.6 && e.currentPriceRelative < 0.8).length,
              color: '#177245'
            },
            {
              label: '[0.8, 1.0]',
              value: items.filter(e => e.currentPriceRelative >= 0.8 && e.currentPriceRelative <= 1).length,
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
      Object.assign(o, { [key]: query[key] });
    });
    return o;
  }




}