import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CexFutureService, CexFuture, NotifyObserverTypes } from 'src/app/shared';
import { removeNullOrUndefined } from 'src/app/utils';

@Component({
  selector: 'app-cex-future-page',
  templateUrl: './cex-future-page.component.html',
  styleUrls: ['./cex-future-page.component.less'],
})
export class CexFuturePageComponent implements OnInit {
  constructor(
    private readonly cexFutureService: CexFutureService,
    private readonly fb: FormBuilder,
    private readonly notification: NzNotificationService,
  ) { }

  total = 0;
  items: CexFuture[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: 1,
  };

  form: FormGroup<any> = this.fb.group({
    symbol: [null],
    hasCollect: [null]
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
  marketType = NotifyObserverTypes.MARKET

  submitForm(): void {
    this.query = removeNullOrUndefined(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset();
    this.query = removeNullOrUndefined(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();
  }

  changeCollet(item: CexFuture) {
    this.cexFutureService.update(item._id, { hasCollect: !item.hasCollect })
      .subscribe({
        next: () => {
          const s = item.hasCollect ? '取消标记' : '标记'
          this.notification.success(`${s}成功`, `${s}成功`)
          this.loadDataFromServer();
        },
        error: (err: Error) => {
          const s = item.hasCollect ? '取消标记' : '标记'
          this.notification.error(`${s}失败`, `${err.message}`)
        }
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

  private loadDataFromServer(): void {
    this.loading = true;
    this.cexFutureService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map(e => ({
          ...e,
        }));
      });

    this.cexFutureService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // symbol 支持正则查询
    const o: { [key: string]: any } = {
    };
    Object.keys(query).forEach((key) => {
      if (key === 'symbol') {
        Object.assign(o, {
          ['symbol']: { $regex: query['symbol'].trim(), $options: 'i' },
        });
      } else if (key === 'hasCollect') {
        Object.assign(o, {
          ['hasCollect']: !!query['hasCollect'] ? true : { $in: [false, null, undefined] },
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
        createdAt: 1,
      };
    }

    if (sortField === 'createdAtStr') {
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
