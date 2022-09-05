import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CexTokenDaily } from './models/cex-token-daily.model';
import { CexTokenDailyService } from './services/cex-token-daily.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormBuilder } from '@angular/forms';
import { removeNullOrUndefined } from 'src/app/utils';
import { CreateProjectService } from 'src/app/modules/create-project';
import { Project } from 'src/app/shared';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.less'],
})
export class OverviewComponent implements OnInit {
  constructor(
    private readonly cexTokenDailyService: CexTokenDailyService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private viewContainerRef: ViewContainerRef,
    private createProjectService: CreateProjectService
  ) {}

  total = 1;
  cexTokenDailies: CexTokenDaily[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    investorName: [null],
    projectName: [null],
  });

  isVisible = false;
  projects: { name: string; website: string; investors: string[] }[] = [];
  modalLoading = false;

  submitForm(): void {
    console.log('submitForm', this.form.value);
    this.query = removeNullOrUndefined(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset();
    console.log('resetForm', this.form.value);
    this.query = removeNullOrUndefined(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log('onQueryParamsChange ', params);
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sort = this.buildSort(sortField, sortOrder);
    this.loadDataFromServer();
  }

  confirmDelete(item: CexTokenDaily) {
    console.log(`confirmDelete(): `, item);
    this.cexTokenDailyService.deleteByID(item._id).subscribe({
      next: () => {
        this.notification.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => {},
      error: (e) => {
        this.notification.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: CexTokenDaily) {}

  private loadDataFromServer(): void {
    this.loading = true;
    this.cexTokenDailyService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.cexTokenDailies = results;
      });

    this.cexTokenDailyService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // projectName 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'projectName') {
        Object.assign(o, {
          ['projectName']: { $regex: query['projectName'], $options: 'i' },
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
}
