import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CexTokenDaily } from 'src/app/shared';
import { CexTokenDailyService } from 'src/app/shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormBuilder, FormControl } from '@angular/forms';
import { removeEmpty } from 'src/app/utils';
import { ActivatedRoute } from '@angular/router';
import { tokenTagNameOfTotalMarket } from 'src/app/shared';
import { CexTokenTagService } from 'src/app/shared';
import { KlineIntervals, KlineIntervalService } from 'src/app/shared';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.less'],
})
export class OverviewComponent implements OnInit {
  constructor(
    private readonly cexTokenDailyService: CexTokenDailyService,
    private readonly cexTokenTagService: CexTokenTagService,
    private readonly klineIntervalService: KlineIntervalService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute
  ) { }

  total = 0;
  cexTokenDailies: CexTokenDaily[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };
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
    interval: [this.intervals[0].name],
    name: [''],
    lucky: [false],
    latestIntervals: [1],
    symbol: [''],
  });

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
      interval: this.intervals[0].name,
      latestIntervals: 1,
      lucky: false,
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['symbol']) {
      const symbol = decodeURIComponent(
        this.route.snapshot.queryParams['symbol']
      );
      this.form.get('symbol')?.patchValue(symbol);
    }

    if (this.route.snapshot.queryParams['latestIntervals']) {
      const latestIntervals = decodeURIComponent(
        this.route.snapshot.queryParams['latestIntervals']
      );
      this.form.get('latestIntervals')?.patchValue(Number(latestIntervals));
    }

    this.loadTags();
    this.loadDataFromServer();

    this.tagCtrl.valueChanges.subscribe(() => {
      this.pageIndex = 1;
      this.pageSize = 10;
      this.loadDataFromServer();
    });
  }

  resolveMoreHref(symbol: string): string {
    return `${location.protocol}//${location.host
      }/overview?symbol=${encodeURIComponent(symbol)}&latestIntervals=0`;
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
      backgroundColor: `rgba(${color === 'green'
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
    this.cexTokenDailyService.deleteByID(item._id).subscribe({
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

  cancelDelete(item: CexTokenDaily) { }

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
    this.cexTokenDailyService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe(
        (results) => {
          this.loading = false;
          this.status = 'success';
          this.cexTokenDailies = results;
        },
        (e: Error) => {
          this.loading = false;
          this.status = 'error';
          this.notification.error(`获取失败`, `${e.message}`);
        }
      );

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
          ['$or']: [
            { name: { $regex: query['name'].trim(), $options: 'i' } },
            { symbol: { $regex: query['name'].trim(), $options: 'i' } },
          ],
        });
      } else if (key === 'latestIntervals') {
        Object.assign(
          o,
          this.resolveLatestIntervals(query[key], query['interval'])
        );
      } else if (key === 'lucky') {
        Object.assign(
          o,
          query['lucky']
            ? {
              volumeMultiple: { $gte: 3 },
              emaCompressionRelative: { $lte: 0.1 },
              volume: { $gte: this.resolveVolumeLimit(query['interval']) },
            }
            : {}
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

  private resolveVolumeLimit(interval: KlineIntervals): number {
    switch (interval) {
      case KlineIntervals.FOUR_HOURS:
        return 1e6;
      case KlineIntervals.ONE_DAY:
        return 6e6;
      default:
        console.warn(`resolveVolumeLimit() unknown interval: ${interval}`);
        return 1e6;
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
