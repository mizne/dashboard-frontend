import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { removeEmpty } from 'src/app/utils';
import { tokenTagNameOfTotalMarket } from '../../models/cex-token-tag.model';
import { CexToken } from '../../models/cex-token.model';
import { CexTokenTagService } from '../../services/cex-token-tag.service';
import { CexTokenService } from '../../services/cex-token.service';

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

  visible = false;

  total = 1;
  cexTokens: CexToken[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    name: [''],
    createdAt: [0],
  });
  createdAtOptions = [
    {
      label: '最近 1 天',
      value: 24 * 60 * 60 * 1e3,
    },
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
      label: '全部',
      value: 0,
    },
  ];

  tags: Array<{ label: string; name: string }> = [];
  tagCtrl = new FormControl('');

  status: 'loading' | 'error' | 'success' | '' = '';

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

  confirmDelete(item: CexToken) {
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

  cancelDelete(item: CexToken) { }

  private loadTags() {
    this.cexTokenTagService.queryList().subscribe((items) => {
      this.tags = [{ label: '全部', name: '' }].concat(
        items
          .map((e) => ({ label: e.label, name: e.name }))
          .filter((e) => e.name !== tokenTagNameOfTotalMarket)
      );
    });
  }

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
          this.loading = false;
          this.status = 'success';
          this.cexTokens = results;
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
    this.loadTags();
    this.loadDataFromServer();
  }

  close(): void {
    this.visible = false;
  }
}
