import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CexTokenDaily, DailyInterval } from './models/cex-token-daily.model';
import { CexTokenDailyService } from './services/cex-token-daily.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormBuilder, FormControl } from '@angular/forms';
import { paddingZero, removeEmpty } from 'src/app/utils';
import { format, parse } from 'date-fns';
import { ActivatedRoute } from '@angular/router';

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
    private readonly route: ActivatedRoute
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
  intervals = [
    {
      label: '4h',
      name: DailyInterval.FOUR_HOURS,
    },
    {
      label: '1d',
      name: DailyInterval.ONE_DAY,
    },
  ];
  form = this.fb.group({
    interval: [this.intervals[0].name],
    name: [''],
    lucky: [false],
    latestIntervals: [1],
  });

  tags: Array<{ label: string; value: string }> = [
    {
      label: '全部',
      value: '',
    },
    {
      label: 'Metaverse',
      value: 'Metaverse',
    },
    {
      label: 'Gaming',
      value: 'Gaming',
    },
    {
      label: 'DEFI',
      value: 'defi',
    },
    {
      label: 'Innovation',
      value: 'innovation-zone',
    },
    {
      label: 'Layer1 / Layer2',
      value: 'Layer1_Layer2',
    },
    {
      label: 'Fan Token',
      value: 'fan_token',
    },
    {
      label: 'NFT',
      value: 'NFT',
    },
    {
      label: 'Storage',
      value: 'storage-zone',
    },
    {
      label: 'Polkadot',
      value: 'Polkadot',
    },
    {
      label: 'POS',
      value: 'pos',
    },
    {
      label: 'POW',
      value: 'pow',
    },
    {
      label: 'Launchpad',
      value: 'Launchpad',
    },
    {
      label: 'Launchpool',
      value: 'Launchpool',
    },
    {
      label: 'BNB Chain',
      value: 'bnbchain',
    },
    {
      label: 'Infrastructure',
      value: 'Infrastructure',
    },
  ];
  tagCtrl = new FormControl(this.tags[0].value);

  submitForm(): void {
    console.log('submitForm', this.form.value);
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
    console.log('resetForm', this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['name']) {
      const name = decodeURIComponent(this.route.snapshot.queryParams['name']);
      this.form.get('name')?.patchValue(name);
    }

    if (this.route.snapshot.queryParams['latestIntervals']) {
      const latestIntervals = decodeURIComponent(
        this.route.snapshot.queryParams['latestIntervals']
      );
      this.form.get('latestIntervals')?.patchValue(Number(latestIntervals));
    }

    this.loadDataFromServer();

    this.tagCtrl.valueChanges.subscribe(() => {
      this.pageIndex = 1;
      this.pageSize = 10;
      this.loadDataFromServer();
    });
  }

  resolveMoreHref(name: string): string {
    return `${location.protocol}//${
      location.host
    }/overview?name=${encodeURIComponent(name)}&latestIntervals=0`;
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
      ...removeEmpty(this.form.value),
      ...(this.tagCtrl.value ? { tags: this.tagCtrl.value } : {}),
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
              }
            : {}
        );
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    console.log(`adjustQuery() o: `, o);
    return o;
  }

  private resolveLatestIntervals(
    latestIntervals: number,
    interval: DailyInterval
  ): { [key: string]: any } {
    if (latestIntervals <= 0) {
      return {};
    }

    switch (interval) {
      case DailyInterval.FOUR_HOURS:
        return {
          time: { $gte: this.resolveFourHoursIntervalMills(latestIntervals) },
        };
      case DailyInterval.ONE_DAY:
        return {
          time: { $gte: this.resolveOneDayIntervalMills(latestIntervals) },
        };
      default:
        console.warn(`resolveLatestIntervals() unknown interval: ${interval}`);
        return {
          time: { $gte: this.resolveFourHoursIntervalMills(latestIntervals) },
        };
    }
  }

  private resolveFourHoursIntervalMills(latestIntervals: number): number {
    const fourHours = 4 * 60 * 60 * 1e3;
    const hours = [0, 4, 8, 12, 16, 20];
    const currentHour = new Date().getHours();
    const theHourIndex = hours.findIndex((e) => e > currentHour);
    const theHour =
      theHourIndex >= 0 ? hours[theHourIndex - 1] : hours[hours.length - 1];

    const theMills = parse(
      format(new Date(), 'yyyy-MM-dd') +
        ` ${paddingZero(String(theHour))}:00:00`,
      'yyyy-MM-dd HH:mm:ss',
      new Date()
    ).getTime();

    return theMills - (latestIntervals - 1) * fourHours;
  }

  private resolveOneDayIntervalMills(latestIntervals: number): number {
    const oneDay = 24 * 60 * 60 * 1e3;
    const currentHour = new Date().getHours();
    if (currentHour >= 8) {
      // 返回当天08:00:00的时间戳 及天数差值
      return (
        parse(
          format(new Date(), 'yyyy-MM-dd') + ' 08:00:00',
          'yyyy-MM-dd HH:mm:ss',
          new Date()
        ).getTime() -
        (latestIntervals - 1) * oneDay
      );
    } else {
      // 返回前一天08:00:00的时间戳 及天数差值
      return (
        parse(
          format(new Date().getTime() - oneDay, 'yyyy-MM-dd') + ' 08:00:00',
          'yyyy-MM-dd HH:mm:ss',
          new Date()
        ).getTime() -
        (latestIntervals - 1) * oneDay
      );
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
