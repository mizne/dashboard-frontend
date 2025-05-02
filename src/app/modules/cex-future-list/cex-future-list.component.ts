import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subscription } from 'rxjs';
import { removeEmpty } from 'src/app/utils';
import { CexFuture, CexFutureService, tokenTagNameOfTotalMarket } from 'src/app/shared';
import { CexToken } from 'src/app/shared';
import { CexTokenTagService } from 'src/app/shared';
import { CexTokenService } from 'src/app/shared';

interface TableItem extends CexFuture {
  hasCollectCtrl: FormControl;
}

@Component({
  selector: 'cex-future-list',
  templateUrl: 'cex-future-list.component.html',
})
export class CexFutureListComponent implements OnInit {
  constructor(
    private readonly cexFutureService: CexFutureService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  visible = false;

  total = 0;
  items: TableItem[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    symbol: [null],
    hasCollect: [null],
    enableLiquidationNotification: [null],
    createdAt: [0],
  });
  colletStatuses = [
    {
      label: '所有',
      value: null
    },
    {
      label: '已标记',
      value: true
    },
    {
      label: '未标记',
      value: false
    }
  ]
  enableLiquidationNotifications = [
    {
      label: '所有',
      value: null
    },
    {
      label: '已开启',
      value: true
    },
    {
      label: '未开启',
      value: false
    }
  ]
  createdAtOptions = [
    // {
    //   label: '最近 1 天',
    //   value: 24 * 60 * 60 * 1e3,
    // },
    {
      label: '最近 3 天',
      value: 3 * 24 * 60 * 60 * 1e3,
    },
    {
      label: '最近 7 天',
      value: 7 * 24 * 60 * 60 * 1e3,
    },
    {
      label: '最近 30 天',
      value: 30 * 24 * 60 * 60 * 1e3,
    },
    {
      label: '最近 90 天',
      value: 90 * 24 * 60 * 60 * 1e3,
    },
    {
      label: '最近 180 天',
      value: 180 * 24 * 60 * 60 * 1e3,
    },
    {
      label: '最近 360 天',
      value: 360 * 24 * 60 * 60 * 1e3,
    },
    {
      label: '全部',
      value: 0,
    },
  ];

  status: 'loading' | 'error' | 'success' | '' = '';

  subscriptions: Subscription[] = [];

  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      createdAt: 0,
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
  }

  updateLiquidationNotification(ev: any, item: TableItem) {
    this.cexFutureService.updateEnableLiquidationNotification({
      id: item._id,
      symbol: ev.symbol,
      enableLiquidationNotification: ev.enableLiquidationNotification,
      liquidationAmountLimit: ev.liquidationAmountLimit,
    }).subscribe({
      next: () => {
        this.notification.success(`修改清算通知成功`, `修改清算通知成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.notification.error(`修改清算通知失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  updateSlug(ev: any, item: TableItem) {
    this.cexFutureService.update(item._id, {
      slug: ev.slug,
    }).subscribe({
      next: () => {
        this.notification.success(`修改slug成功`, `修改slug成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.notification.error(`修改slug失败`, `请稍后重试，${e.message}`);
      },
    });
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

  confirmDelete(item: TableItem) {
    this.cexFutureService.deleteByID(item._id).subscribe({
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

  cancelDelete(item: TableItem) { }

  private loadDataFromServer(): void {
    this.loading = true;
    this.status = 'loading';
    this.query = {
      ...removeEmpty(this.form.value),
    };
    this.cexFutureService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe(
        (results) => {
          this.unsubscribeHasCollectCtrl();
          this.loading = false;
          this.status = 'success';
          this.items = results.map(e => ({
            ...e,
            hasCollectCtrl: new FormControl(e.hasCollect)
          }));

          this.subscribeHasCollectCtrl();
        },
        (e: Error) => {
          this.loading = false;
          this.status = 'error';
          this.notification.error(`获取失败`, `${e.message}`);
        }
      );

    this.cexFutureService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private unsubscribeHasCollectCtrl() {
    for (const e of this.subscriptions) {
      e.unsubscribe();
    }
    this.subscriptions = [];
  }

  private subscribeHasCollectCtrl() {
    for (const item of this.items) {
      const sub = item.hasCollectCtrl.valueChanges.subscribe(hasCollect => {
        this.handleHasCollectChange(item, hasCollect)
      })
      this.subscriptions.push(sub)
    }
  }

  private handleHasCollectChange(item: TableItem, hasCollect: boolean) {
    this.cexFutureService.update(item._id, { hasCollect: hasCollect })
      .subscribe({
        next: () => {
          const s = item.hasCollect ? '取消标记' : '标记'
          this.notification.success(`${s} ${item.symbol} 成功`, `${s} ${item.symbol} 成功`)
          this.loadDataFromServer();
        },
        error: (err: Error) => {
          const s = item.hasCollect ? '取消标记' : '标记'
          this.notification.error(`${s} ${item.symbol} 失败`, `${err.message}`)
          item.hasCollectCtrl.patchValue(!hasCollect, { emitEvent: false })
        }
      })
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'symbol') {
        Object.assign(o, {
          ['symbol']: { $regex: query['symbol'].trim(), $options: 'i' },
        });
      } else if (key === 'hasCollect') {
        Object.assign(o, {
          ['hasCollect']: !!query['hasCollect'] ? true : { $in: [false, null, undefined] },
        });
      } else if (key === 'enableLiquidationNotification') {
        Object.assign(o, {
          ['enableLiquidationNotification']: !!query['enableLiquidationNotification'] ? true : { $in: [false, null, undefined] },
        });
      } else if (key === 'createdAt') {
        Object.assign(
          o,
          query['createdAt']
            ? {
              createdAt: { $gte: new Date().getTime() - query['createdAt'] },
            }
            : {}
        );
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
  }

  close(): void {
    this.visible = false;
  }
}
