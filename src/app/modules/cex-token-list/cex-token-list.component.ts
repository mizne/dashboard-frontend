import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subscription } from 'rxjs';
import { removeEmpty } from 'src/app/utils';
import { tokenTagNameOfTotalMarket } from 'src/app/shared';
import { CexToken } from 'src/app/shared';
import { CexTokenTagService } from 'src/app/shared';
import { CexTokenService } from 'src/app/shared';

interface TableItem extends CexToken {
}

@Component({
  selector: 'cex-token-list',
  templateUrl: 'cex-token-list.component.html',
})
export class CexTokenListComponent implements OnInit {
  constructor(
    private readonly cexTokenService: CexTokenService,
    private readonly cexTokenTagService: CexTokenTagService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  visible = false;

  total = 0;
  cexTokens: TableItem[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    name: [''],
    hasCollect: [null],
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

  tagCtrl = new FormControl(null);

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
    this.tagCtrl.valueChanges.subscribe(() => {
      this.pageIndex = 1;
      this.pageSize = 10;
      this.loadDataFromServer();
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
    this.cexTokenService.deleteByID(item._id).subscribe({
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
      ...(this.tagCtrl.value ? { tags: this.tagCtrl.value } : {}),
    };
    this.cexTokenService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe(
        (results) => {
          this.unsubscribeUpdateEnableTrackingCtrls();
          this.loading = false;
          this.status = 'success';
          this.cexTokens = results.map(e => ({
            ...e,
          }));

          this.subscribeUpdateEnableTrackingCtrls();
        },
        (e: Error) => {
          this.loading = false;
          this.status = 'error';
          this.notification.error(`获取失败`, `${e.message}`);
        }
      );

    this.cexTokenService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private unsubscribeUpdateEnableTrackingCtrls() {
    this.subscriptions.forEach((e) => {
      e.unsubscribe();
    });
    this.subscriptions = [];
  }

  private subscribeUpdateEnableTrackingCtrls() {

  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // name 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'name') {
        Object.assign(o, {
          ['$or']: [
            { name: { $regex: query['name'].trim(), $options: 'i' } },
            { symbol: { $regex: query['name'].trim(), $options: 'i' } },
          ],
        });
      } else if (key === 'hasCollect') {
        Object.assign(o, {
          ['hasCollect']: !!query['hasCollect'] ? true : { $in: [false, null, undefined] },
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