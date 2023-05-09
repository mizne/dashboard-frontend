import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormBuilder } from '@angular/forms';
import { removeEmpty } from 'src/app/utils';
import { NotifyObserverNotAllow, NotifyObserverNotAllowService, NotifyObserverTypes } from 'src/app/shared';
import { CreateNotifyObserverNotAllowService } from 'src/app/modules/create-notify-observer-not-allow';

@Component({
  selector: 'app-notify-observer-not-allow-list',
  templateUrl: './notify-observer-not-allow-list.component.html',
  styleUrls: ['./notify-observer-not-allow-list.component.less'],
})
export class NotifyObserverNotAllowListComponent implements OnInit {
  constructor(
    private readonly notifyObserverNotAllowService: NotifyObserverNotAllowService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly fb: FormBuilder,
    private createNotifyObserverNotAllowService: CreateNotifyObserverNotAllowService
  ) { }

  total = 0;
  items: NotifyObserverNotAllow[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  types = [
    {
      label: '所有',
      value: ''
    },
    {
      label: 'Gaxle',
      value: NotifyObserverTypes.GALXE
    },
    {
      label: 'Quest3',
      value: NotifyObserverTypes.QUEST3
    }
  ]

  form = this.fb.group({
    type: [this.types[0].value],
    url: [null],
  });


  submitForm(): void {
    this.query = removeEmpty(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      type: this.types[0].value
    });
    this.query = removeEmpty(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();
  }

  showCreateModal() {
    const obj: Partial<NotifyObserverNotAllow> = {

    };
    const { success, error } = this.createNotifyObserverNotAllowService.createModal(
      '添加黑名单通知源',
      obj,
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(
        `添加黑名单通知源 成功`,
        `添加黑名单通知源 成功`
      );
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加黑名单通知源 失败`, `${e.message}`);
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

  confirmDelete(item: NotifyObserverNotAllow) {
    this.notifyObserverNotAllowService.deleteByID(item._id).subscribe({
      next: () => {
        this.nzNotificationService.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.nzNotificationService.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: NotifyObserverNotAllow) { }

  private loadDataFromServer(): void {
    this.loading = true;
    this.notifyObserverNotAllowService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results;
      });

    this.notifyObserverNotAllowService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // url 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'url') {
        Object.assign(o, {
          ['url']: { $regex: query['url'].trim(), $options: 'i' },
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
