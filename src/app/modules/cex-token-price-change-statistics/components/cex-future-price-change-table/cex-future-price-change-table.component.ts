import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { format, parse } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { lastValueFrom } from 'rxjs';
import { KlineIntervalService, CexFuturePriceChange, CexFuturePriceChangeService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';

@Component({
  selector: 'cex-future-price-change-table',
  templateUrl: './cex-future-price-change-table.component.html'
})
export class CexFuturePriceChangeTableComponent implements OnInit {



  constructor(
    private readonly cexFuturePriceChangeService: CexFuturePriceChangeService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder,
    private readonly klineIntervalService: KlineIntervalService
  ) { }


  total = 0;
  items: CexFuturePriceChange[] = [];
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

  defaultInDays = 180;
  form = this.fb.group<any>({
    inDays: [this.defaultInDays],
    symbol: [''],
    priceChangePercent: [null],
    currentPriceRelative: [null],
    listingTimeDateRange: [null],
    time: []
  });
  listingTimeRanges = {
    '最近一个月': [new Date(new Date().getTime() - 1 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近三个月': [new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近半年': [new Date(new Date().getTime() - 6 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近一年': [new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1e3), new Date()],
  }

  tagCtrl = new FormControl(null)

  compareWithOthersModalVisible = false
  compareWithOthersModalLoading = false
  compareItems: Array<{
    title: string;
    data: CexFuturePriceChange[]
  }> = []
  compareSymbolsCtrl: FormControl<any> = new FormControl([])

  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      inDays: this.form.get('inDays')?.value
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    // this.form.get('chartFilter')?.valueChanges.subscribe(v => {
    //   console.log(`chartFilter: ${JSON.stringify(v, null, 2)}`)
    // })
    this.loadDataFromServer();
    this.tagCtrl.valueChanges.subscribe(() => {
      this.pageIndex = 1;
      this.pageSize = 10;
      this.loadDataFromServer();
    })

    // this.compareSymbolsCtrl.valueChanges.subscribe(symbols => {
    //   const notDuplicateSymbols: string[] = Array.from(new Set(symbols));
    //   this.fetchCompareWithDataItems(notDuplicateSymbols)
    // })
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

  confirmDelete(item: CexFuturePriceChange) {
    this.cexFuturePriceChangeService.deleteByID(item._id).subscribe({
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

  cancelDelete(item: CexFuturePriceChange) { }

  filterPerformanceUp(item: CexFuturePriceChange) {
    this.form.reset({
      priceChangePercent: { $gte: item.priceChangePercent },
      currentPriceRelative: { $gte: item.currentPriceRelative },
      inDays: this.form.get('inDays')?.value
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  filterPerformanceDown(item: CexFuturePriceChange) {
    this.form.reset({
      priceChangePercent: { $lte: item.priceChangePercent },
      currentPriceRelative: { $lte: item.currentPriceRelative },
      inDays: this.form.get('inDays')?.value
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  compareWithOthers(item: CexFuturePriceChange) {
    this.compareWithOthersModalVisible = true;

    const symbols = Array.from(new Set([item.symbol, 'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']));
    this.compareSymbolsCtrl.patchValue(symbols)
    this.fetchCompareWithDataItems(symbols)
  }

  private async fetchCompareWithDataItems(symbols: string[]) {
    this.compareWithOthersModalLoading = true
    this.compareItems = [];
    const days = this.inDayss.filter(e => !!e.name);
    for (const day of days) {
      const items = await lastValueFrom(this.cexFuturePriceChangeService.queryList({ symbol: { $in: symbols }, inDays: day.name }))
      this.compareItems.push({
        title: day.name + ' 天',
        data: symbols.map(e => items.find(f => f.symbol === e)).filter(e => !!e) as CexFuturePriceChange[]
      })
    }
    this.compareWithOthersModalLoading = false
  }

  private loadDataFromServer(): void {
    this.loading = true;
    this.query = {
      ...removeEmpty(this.form.value),
      ...(this.tagCtrl.value ? { tags: this.tagCtrl.value } : {})
    };
    const adjustedQuery = this.adjustQuery(this.query)
    this.cexFuturePriceChangeService
      .queryList(
        adjustedQuery,
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

    this.cexFuturePriceChangeService
      .queryCount(adjustedQuery)
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
      } else if (key === 'listingTimeDateRange') {

        if (Array.isArray(query['listingTimeDateRange']) && query['listingTimeDateRange'].length === 2) {
          Object.assign(o, {
            ['listingTime']: {
              $gte: query['listingTimeDateRange'][0].getTime(),
              $lte: query['listingTimeDateRange'][1].getTime(),
            }
          });
        }

      } else if (key === 'time' && query['time']) {
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






}