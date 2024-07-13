import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChange, CexTokenPriceChangeService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'cex-token-price-change-statistics',
  templateUrl: 'cex-token-price-change-statistics.component.html'
})
export class CexTokenPriceChangeStatisticsComponent implements OnInit {
  constructor(
    private readonly cexTokenPriceChangeService: CexTokenPriceChangeService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  visible = false;

  total = 0;
  items: CexTokenPriceChange[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

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

  chartDataItems: Array<{
    title: string;
    data: Array<{ label: string; value: number; color: string; }>
  }> = []

  chartDataItems2: Array<{
    title: string;
    data: Array<{ label: string; value: number; color: string; }>
  }> = []

  form = this.fb.group({
    inDays: [this.inDayss[3].name],
    symbol: [''],
    priceChangePercent: [null],
    currentPriceRelative: [null],
    // chartFilter: [[]]
  });

  tagCtrl = new FormControl(null)

  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      inDays: this.inDayss[3].name,
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    // this.form.get('chartFilter')?.valueChanges.subscribe(v => {
    //   console.log(`chartFilter: ${JSON.stringify(v, null, 2)}`)
    // })

    this.tagCtrl.valueChanges.subscribe(() => {
      this.pageIndex = 1;
      this.pageSize = 10;
      this.loadDataFromServer();
    })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sort = this.buildSort(sortField, sortOrder);
    this.loadDataFromServer();
  }

  confirmDelete(item: CexTokenPriceChange) {
    this.cexTokenPriceChangeService.deleteByID(item._id).subscribe({
      next: () => {
        this.notification.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.notification.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: CexTokenPriceChange) { }

  private async loadChartData() {
    const chartDataItems: Array<{
      title: string;
      data: Array<{ label: string; value: number; color: string; }>
    }> = [];

    for (const inDays of this.inDayss) {
      const items = await lastValueFrom(this.cexTokenPriceChangeService.queryList({ inDays: inDays.name }))
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

    this.chartDataItems = chartDataItems;
  }

  private async loadChartData2() {
    const chartDataItems: Array<{
      title: string;
      data: Array<{ label: string; value: number; color: string; }>
    }> = [];

    for (const inDays of this.inDayss) {
      const items = await lastValueFrom(this.cexTokenPriceChangeService.queryList({ inDays: inDays.name }))
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

    this.chartDataItems2 = chartDataItems;
  }

  private loadDataFromServer(): void {
    this.loading = true;
    this.query = {
      ...removeEmpty(this.form.value),
      ...(this.tagCtrl.value ? { tags: this.tagCtrl.value } : {})
    };
    this.cexTokenPriceChangeService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe(
        (results) => {
          this.loading = false;
          this.items = results;
        },
        (e: Error) => {
          this.loading = false;
          this.notification.error(`获取失败`, `${e.message}`);
        }
      );

    this.cexTokenPriceChangeService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // MARK: symbol 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'symbol') {
        Object.assign(o, {
          ['symbol']: { $regex: query['symbol'].trim(), $options: 'i' }
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }

  private buildSort(sortField?: string | null, sortOrder?: string | null) {
    if (!sortField) {
      return {
        createdAt: -1,
      };
    }

    if (sortField === 'timeStr' || sortField === 'createdAtStr') {
      if (sortOrder === 'ascend') {
        return {
          [sortField.slice(0, -3)]: 1,
        };
      }
      if (sortOrder === 'descend') {
        return {
          [sortField.slice(0, -3)]: -1,
        };
      }
    }

    return sortOrder === 'ascend'
      ? { [sortField]: 1 }
      : sortOrder === 'descend'
        ? { [sortField]: -1 }
        : {
          createdAt: -1,
        };
  }

  open(): void {
    this.visible = true;
    this.loadDataFromServer();

    this.loadChartData()
    this.loadChartData2()
  }

  close(): void {
    this.visible = false;
  }
}