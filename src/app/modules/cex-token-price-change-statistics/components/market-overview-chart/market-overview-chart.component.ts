import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChangeService } from 'src/app/shared';
import { removeEmpty, stringifyNumber } from 'src/app/utils';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'market-overview-chart',
  templateUrl: 'market-overview-chart.component.html'
})
export class MarketOverviewChartComponent implements OnInit {
  constructor(
    private readonly cexTokenPriceChangeService: CexTokenPriceChangeService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder
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

  data: Array<{
    label: string;
    value1: number;
    value2: number;
    value3: number;
  }> = [];

  alias = {
    label: 'Symbol',
    value1: '涨跌幅',
    value2: '当前价位',
    value3: '市值'
  }


  formatter = {
    label: (value: number) => {
      return value
    },
    value1: (value: number) => {
      return `${(value * 100).toFixed(3)}%`
    },
    value2: (value: number) => {
      return `${(value).toFixed(3)}`
    },
    value3: (value: number) => {
      return stringifyNumber(value)
    }
  }

  styleKey = 'value1'
  styleCallback = (val: any) => {
    return {
      lineWidth: 1,
      strokeOpacity: 1,
      fillOpacity: 0.3,
      opacity: 0.65,
      fill: val > 0 ? '#50C878' : '#FE6F5E'
    };
  }


  loading = false;


  form = this.fb.group({
    inDays: [180],
  });

  submitForm(): void {
    this.loadChartData();
  }

  resetForm() {
    this.form.reset({
      inDays: 180
    });
    this.loadChartData();
  }

  ngOnInit(): void {
    this.loadChartData();
  }


  private async loadChartData() {
    this.loading = true;
    const inDays = this.form.get('inDays')?.value

    if (inDays) {
      const items = await lastValueFrom(this.cexTokenPriceChangeService.queryList({
        inDays: inDays,
      }))

      this.data = items.map(e => {
        return {
          label: e.symbol,
          value1: e.priceChangePercent,
          value2: e.currentPriceRelative,
          value3: e.marketCap
        }
      })
    }
    this.loading = false;
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