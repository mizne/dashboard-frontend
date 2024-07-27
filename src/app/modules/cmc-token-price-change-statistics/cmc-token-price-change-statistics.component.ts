import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CMCTokenDailyService, CMCTokenPriceChange, CMCTokenPriceChangeService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { lastValueFrom } from 'rxjs';
import { format } from 'date-fns';

@Component({
  selector: 'cmc-token-price-change-statistics',
  templateUrl: 'cmc-token-price-change-statistics.component.html'
})
export class CMCTokenPriceChangeStatisticsComponent implements OnInit {
  constructor(
    private readonly cmcTokenPriceChangeService: CMCTokenPriceChangeService,
    private readonly cmcTokenDailyService: CMCTokenDailyService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  visible = false;
  modalTitle = '涨跌幅统计'

  total = 0;
  items: CMCTokenPriceChange[] = [];
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

  form = this.fb.group<any>({
    inDays: [this.inDayss[3].name],
    symbol: [''],
    priceChangePercent: [null],
    currentPriceRelative: [null],
    // chartFilter: [[]]
  });

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

    this.resolveModalTitle()
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

  confirmDelete(item: CMCTokenPriceChange) {
    this.cmcTokenPriceChangeService.deleteByID(item._id).subscribe({
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

  cancelDelete(item: CMCTokenPriceChange) { }

  filterPerformanceUp(item: CMCTokenPriceChange) {
    this.form.reset({
      priceChangePercent: { $gte: item.priceChangePercent },
      currentPriceRelative: { $gte: item.currentPriceRelative },
      inDays: this.form.get('inDays')?.value
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  filterPerformanceDown(item: CMCTokenPriceChange) {
    this.form.reset({
      priceChangePercent: { $lte: item.priceChangePercent },
      currentPriceRelative: { $lte: item.currentPriceRelative },
      inDays: this.form.get('inDays')?.value
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  private async resolveModalTitle() {
    const startTimeItems = await lastValueFrom(this.cmcTokenDailyService.queryList({}, { number: 1, size: 1 }, { time: 1 }))
    const endTimeItems = await lastValueFrom(this.cmcTokenDailyService.queryList({}, { number: 1, size: 1 }, { time: -1 }))

    if (startTimeItems.length === 1 && endTimeItems.length === 1) {
      const startTimeStr = format(startTimeItems[0].time, 'yyyy-MM-dd HH:mm:ss')
      const endTimeStr = format(endTimeItems[0].time, 'yyyy-MM-dd HH:mm:ss')

      this.modalTitle = `涨跌幅统计 数据统计时间 ${startTimeStr} ~ ${endTimeStr}`
    }

  }



  private loadDataFromServer(): void {
    this.loading = true;
    this.query = {
      ...removeEmpty(this.form.value),
    };
    this.cmcTokenPriceChangeService
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

    this.cmcTokenPriceChangeService
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
    this.resolveModalTitle()
  }

  close(): void {
    this.visible = false;
  }
}