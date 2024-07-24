import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChange, CexTokenPriceChangeService, CustomDateRangeCexTokenPriceChange } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { format, parse } from 'date-fns';

@Component({
  selector: 'custom-date-range',
  templateUrl: 'custom-date-range.component.html'
})
export class CustomDateRangeComponent implements OnInit {
  constructor(
    private readonly cexTokenPriceChangeService: CexTokenPriceChangeService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  visible = false;

  total = 0;
  items: CustomDateRangeCexTokenPriceChange[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };


  form = this.fb.group<any>({
    dateRange: [null],
    symbol: [''],
    priceChangePercent: [null],
    currentPriceRelative: [null],
  });

  marketCapSortFn = (a: CustomDateRangeCexTokenPriceChange, b: CustomDateRangeCexTokenPriceChange) => a.marketCap - b.marketCap
  priceChangePercentSortFn = (a: CustomDateRangeCexTokenPriceChange, b: CustomDateRangeCexTokenPriceChange) => a.priceChangePercent - b.priceChangePercent
  currentPriceRelativeSortFn = (a: CustomDateRangeCexTokenPriceChange, b: CustomDateRangeCexTokenPriceChange) => a.currentPriceRelative - b.currentPriceRelative
  inDaysSortFn = (a: CustomDateRangeCexTokenPriceChange, b: CustomDateRangeCexTokenPriceChange) => a.inDays - b.inDays
  updatedAtSortFn = (a: CustomDateRangeCexTokenPriceChange, b: CustomDateRangeCexTokenPriceChange) => (a.updatedAt || 0) - (b.updatedAt || 0)

  chartDataItems: Array<{
    title: string;
    data: Array<{ label: string; value: number; color: string; }>
  }> = []

  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    const { start, end } = this.resolveDefaultDateRange()
    this.form.reset({
      dateRange: [new Date(start), new Date(end)]
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    const { start, end } = this.resolveDefaultDateRange()
    this.form.patchValue({
      dateRange: [new Date(start), new Date(end)]
    })
  }

  private resolveDefaultDateRange() {
    const dateRange = this.form.get('dateRange')?.value;
    if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
      return {
        start: dateRange[0].getTime(),
        end: dateRange[1].getTime(),
      }
    }

    const end = parse(`${format(new Date(), 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime();
    if (end > new Date().getTime()) {
      return {
        start: end - 31 * 24 * 60 * 60 * 1e3,
        end: end - 1 * 24 * 60 * 60 * 1e3
      }
    }

    return {
      start: end - 30 * 24 * 60 * 60 * 1e3,
      end: end
    }
  }


  filterPerformanceUp(item: CexTokenPriceChange) {
    const { start, end } = this.resolveDefaultDateRange()
    this.form.reset({
      priceChangePercent: { $gte: item.priceChangePercent },
      currentPriceRelative: { $gte: item.currentPriceRelative },
      dateRange: [new Date(start), new Date(end)]
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  filterPerformanceDown(item: CexTokenPriceChange) {
    const { start, end } = this.resolveDefaultDateRange()
    this.form.reset({
      priceChangePercent: { $lte: item.priceChangePercent },
      currentPriceRelative: { $lte: item.currentPriceRelative },
      dateRange: [new Date(start), new Date(end)]
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  private loadDataFromServer(): void {
    const dateRange = this.form.get('dateRange')?.value as Array<Date>
    if (dateRange && dateRange[1] && dateRange[1].getTime() > new Date().getTime()) {
      this.notification.warning(`时间周期错误`, `今天还没有到8点, 没有当天价格数据`)
      return
    }


    this.loading = true;
    this.query = {
      ...removeEmpty(this.form.value),
    };
    this.cexTokenPriceChangeService
      .queryListCustomDateRange(
        this.query['dateRange'][0].getTime(),
        this.query['dateRange'][1].getTime(),
      )
      .subscribe(
        (results) => {
          this.loading = false;
          const adjustResults = this.filterResults(results);
          this.items = adjustResults;
          this.total = adjustResults.length;

          this.resolveChartDataItems(adjustResults)
        },
        (e: Error) => {
          this.loading = false;
          this.notification.error(`获取失败`, `${e.message}`);
        }
      );
  }

  private filterResults(results: CustomDateRangeCexTokenPriceChange[]): CustomDateRangeCexTokenPriceChange[] {
    if (this.query['symbol']) {
      results = results.filter(e => e.symbol.toLowerCase().indexOf(this.query['symbol'].toLowerCase()) >= 0)
    }

    if (this.query['priceChangePercent']) {
      if (this.query['priceChangePercent']['$lt']) {
        results = results.filter(e => e.priceChangePercent < this.query['priceChangePercent']['$lt'])
      }
      if (this.query['priceChangePercent']['$lte']) {
        results = results.filter(e => e.priceChangePercent <= this.query['priceChangePercent']['$lte'])
      }
      if (this.query['priceChangePercent']['$gt']) {
        results = results.filter(e => e.priceChangePercent > this.query['priceChangePercent']['$gt'])
      }
      if (this.query['priceChangePercent']['$gte']) {
        results = results.filter(e => e.priceChangePercent >= this.query['priceChangePercent']['$gte'])
      }
    }

    if (this.query['currentPriceRelative']) {
      if (this.query['currentPriceRelative']['$lt']) {
        results = results.filter(e => e.currentPriceRelative < this.query['currentPriceRelative']['$lt'])
      }
      if (this.query['currentPriceRelative']['$lte']) {
        results = results.filter(e => e.currentPriceRelative <= this.query['currentPriceRelative']['$lte'])
      }
      if (this.query['currentPriceRelative']['$gt']) {
        results = results.filter(e => e.currentPriceRelative > this.query['currentPriceRelative']['$gt'])
      }
      if (this.query['currentPriceRelative']['$gte']) {
        results = results.filter(e => e.currentPriceRelative >= this.query['currentPriceRelative']['$gte'])
      }
    }

    return results
  }

  private resolveChartDataItems(items: CustomDateRangeCexTokenPriceChange[]) {
    const priceChangeChartData = {
      title: `涨跌幅分布`,
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

    const priceRelativeChartData = {
      title: `当前价位分布`,
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


    this.chartDataItems = [
      priceChangeChartData,
      priceRelativeChartData
    ]
  }


  open(): void {
    this.visible = true;
    this.loadDataFromServer();
  }

  close(): void {
    this.visible = false;
  }
}