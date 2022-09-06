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
  extraQuery: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };
  intervals = [
    {
      label: '4h',
      name: '4h',
    },
    {
      label: '1d',
      name: '1d',
    },
  ];
  form = this.fb.group({
    interval: [this.intervals[0].name],
    name: [null],
  });

  submitForm(): void {
    console.log('submitForm', this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.extraQuery = {};
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      interval: this.intervals[0].name,
    });
    console.log('resetForm', this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.extraQuery = {};
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();
  }

  showLucky() {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.extraQuery = {
      volumeMultiple: { $gte: 3 },
      emaCompressionRelative: { $lte: 0.1 },
    };
    this.loadDataFromServer();
  }

  genTdStyle() {
    return {
      padding: '4px 12px',
    };
  }

  genDataStyle(n: number) {
    const color = n > 0 ? 'green' : n < 0 ? 'red' : 'white';
    const alpha = this.resolveAlpha(Math.abs(n));
    return {
      backgroundColor: `rgba(${
        color === 'green'
          ? '0, 255, 0'
          : color === 'red'
          ? '255, 0, 0'
          : '255, 255, 255'
      }, ${alpha})`,

      width: '100%',
      height: '44px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      padding: '4px 6px',
    };
  }

  private resolveAlpha(n: number): number {
    if (n <= 0.02) {
      return 0.1;
    }
    if (n <= 0.05) {
      return 0.25;
    }

    if (n <= 0.1) {
      return 0.4;
    }

    if (n <= 0.2) {
      return 0.8;
    }

    return 1;
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
    this.query = {
      ...removeNullOrUndefined(this.form.value),
      ...this.extraQuery,
    };
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
    // name 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'name') {
        Object.assign(o, {
          ['name']: { $regex: query['name'], $options: 'i' },
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

    if (sortField === 'emaCompressionRelative') {
      if (sortOrder === 'ascend') {
        return {
          [sortField]: -1,
        };
      }
      if (sortOrder === 'descend') {
        return {
          [sortField]: 1,
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
