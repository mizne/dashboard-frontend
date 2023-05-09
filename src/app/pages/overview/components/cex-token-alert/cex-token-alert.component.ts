import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { KlineIntervals, KlineIntervalService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { CexTokenAlert, CexTokenAlertTypes } from 'src/app/shared';
import { CexToken } from 'src/app/shared';
import { CexTokenAlertService } from 'src/app/shared';

@Component({
  selector: 'cex-token-alert',
  templateUrl: 'cex-token-alert.component.html',
})
export class CexTokenAlertComponent implements OnInit {
  constructor(
    private readonly cexTokenAlertService: CexTokenAlertService,
    private readonly notification: NzNotificationService,
    private readonly klineIntervalService: KlineIntervalService,
    private fb: FormBuilder
  ) { }

  visible = false;

  total = 0;
  cexTokenAlerts: CexTokenAlert[] = [];
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
      label: '大量',
      value: CexTokenAlertTypes.BIG_VOLUME
    },
    {
      label: '趋势转折',
      value: CexTokenAlertTypes.TRENDING_CHANGE
    }
  ]

  intervals = [
    {
      label: '4h',
      name: KlineIntervals.FOUR_HOURS,
    },
    {
      label: '1d',
      name: KlineIntervals.ONE_DAY,
    },
  ];

  form = this.fb.group({
    type: [this.types[0].value],
    interval: [this.intervals[0].name],
    name: [''],
    latestIntervals: [1],
  });

  status: 'loading' | 'error' | 'success' | '' = '';

  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      type: this.types[0].value,
      interval: this.intervals[0].name,
      latestIntervals: 1,
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {

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
    this.cexTokenAlertService.deleteByID(item._id).subscribe({
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

  private loadDataFromServer(): void {
    this.loading = true;
    this.status = 'loading';
    this.query = {
      ...removeEmpty(this.form.value),
    };
    this.cexTokenAlertService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe(
        (results) => {
          this.loading = false;
          this.status = 'success';
          this.cexTokenAlerts = results;
        },
        (e: Error) => {
          this.loading = false;
          this.status = 'error';
          this.notification.error(`获取失败`, `${e.message}`);
        }
      );

    this.cexTokenAlertService
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
            { symbol: { $regex: query['name'].trim(), $options: 'i' } },
          ],
        });
      } else if (key === 'latestIntervals') {
        Object.assign(
          o,
          this.resolveLatestIntervals(query[key], query['interval'])
        );
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }

  private resolveLatestIntervals(
    latestIntervals: number,
    interval: KlineIntervals
  ): { [key: string]: any } {
    if (latestIntervals <= 0) {
      return {};
    }

    switch (interval) {
      case KlineIntervals.FOUR_HOURS:
        return {
          time: {
            $gte: this.klineIntervalService.resolveFourHoursIntervalMills(
              latestIntervals
            ),
          },
        };
      case KlineIntervals.ONE_DAY:
        return {
          time: {
            $gte: this.klineIntervalService.resolveOneDayIntervalMills(
              latestIntervals
            ),
          },
        };
      default:
        console.warn(`resolveLatestIntervals() unknown interval: ${interval}`);
        return {
          time: {
            $gte: this.klineIntervalService.resolveFourHoursIntervalMills(
              latestIntervals
            ),
          },
        };
    }
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
  }

  close(): void {
    this.visible = false;
  }
}
