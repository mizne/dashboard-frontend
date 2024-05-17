import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CexTokenDaily, CexTokenDailyService, KlineIntervalService, KlineIntervals, TimerService, tokenTagNameOfTotalMarket } from 'src/app/shared';
import { Observable, lastValueFrom, map, merge, startWith } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';
import { resolvePriceStatus } from 'src/app/utils';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'cex-token-price-status-chart',
  templateUrl: 'cex-token-price-status-chart.component.html'
})
export class CexTokenPriceStatusChartComponent implements OnInit, OnChanges {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexTokenDailyService: CexTokenDailyService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private readonly timerService: TimerService,
  ) { }

  @Input() tag: string = '';
  @Input() interval: KlineIntervals = KlineIntervals.FOUR_HOURS

  title = '价格形态分布';
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = []

  loading = false;

  visible = false;
  tabsLoading = false;
  tabs: Array<{
    label: string;
    color: string;
    table: {
      list: CexTokenDaily[];
      pageIndex: number;
      pageSize: number;
    }
  }> = []
  form = this.fb.group({
    latestIntervals: [1],
  });
  intervalTime$ = merge(
    this.form.valueChanges,
    this.timerService.interval(1)
  ).pipe(
    startWith(this.form.value),
    map(() => {
      return this.klineInterval.resolveFourHoursIntervalMills(
        this.form.get('latestIntervals')?.value as number
      );
    })
  );

  marketCompare = (a: CexTokenDaily, b: CexTokenDaily) => a.marketCap - b.marketCap
  priceCompare = (a: CexTokenDaily, b: CexTokenDaily) => a.price - b.price
  volumeCompare = (a: CexTokenDaily, b: CexTokenDaily) => a.volume - b.volume
  volumeMultipleCompare = (a: CexTokenDaily, b: CexTokenDaily) => a.volumeMultiple - b.volumeMultiple
  emaCompressionRelativeCompare = (a: CexTokenDaily, b: CexTokenDaily) => a.emaCompressionRelative - b.emaCompressionRelative
  timeCompare = (a: CexTokenDaily, b: CexTokenDaily) => a.time - b.time
  createdAtCompare = (a: CexTokenDaily, b: CexTokenDaily) => a.createdAt - b.createdAt

  monthModalVisible = false;
  monthModalTitle = '';
  monthModalLoading = false;
  monthModalData: Array<Array<{ time: string; type: string; value: number }>> = [];
  monthModalColors: string[] = [];

  ngOnInit() {
    // this.loadData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadData();
  }

  open() {
    this.visible = true;

    this.fetchTabs();
  }

  async openModal(months: number) {
    if (months <= 1) {
      this.notification.warning(`最少查询 2 个月`, `最少查询 2 个月`)
      return
    }
    this.monthModalData = [];
    this.monthModalVisible = true;
    this.monthModalTitle = `最近 ${months} 个月价格形态分布`;

    for (let i = months; i >= 1; i -= 1) {
      this.monthModalLoading = true;
      let startTime = this.resolveTime(i * 30 * this.resolveCountPerDay());
      let endTime = i === 1 ? new Date().getTime() : this.resolveTime((i - 1) * 30 * this.resolveCountPerDay());

      try {
        const items = await lastValueFrom(this.fetchDataByTime(startTime, endTime));
        this.monthModalLoading = false;

        const totalItems = this.convertData(items)
        this.monthModalData.push(totalItems);
        this.monthModalColors = [
          'rgb(203, 24, 29)',
          'rgb(224, 224, 224)',
          'rgb(35, 139, 69)'
        ]
      } catch (err: any) {
        this.monthModalLoading = false;
        this.notification.error(`获取价格形态数据失败`, `${err.message}`)
      }
    }
  }

  submitForm(): void {
    this.fetchTabs();
  }

  resetForm() {
    this.form.reset({
      latestIntervals: 1,
    });
    this.fetchTabs();
  }
  fetchTabs() {
    this.tabsLoading = true;

    this.cexTokenDailyService.queryList({
      time: this.resolveTime(this.form.get('latestIntervals')?.value as number),
      interval: this.interval,
      ...(this.tag === tokenTagNameOfTotalMarket ? {} : {
        tags: this.tag
      })
    }, undefined, {
      createdAt: 1
    })
      .subscribe({
        next: (items: CexTokenDaily[]) => {
          this.tabsLoading = false;
          this.tabs = [
            {
              label: 'short',
              color: 'rgb(203, 24, 29)',
              table: {
                list: items.filter(e => resolvePriceStatus(e.closeDeltaEma21, e.ema21DeltaEma55, e.ema55DeltaEma144) === 'short'),
                pageIndex: 1,
                pageSize: 10
              }
            },
            {
              label: 'shock',
              color: 'rgb(224, 224, 224)',
              table: {
                list: items.filter(e => resolvePriceStatus(e.closeDeltaEma21, e.ema21DeltaEma55, e.ema55DeltaEma144) === 'shock'),
                pageIndex: 1,
                pageSize: 10
              }
            },
            {
              label: 'long',
              color: 'rgb(35, 139, 69)',
              table: {
                list: items.filter(e => resolvePriceStatus(e.closeDeltaEma21, e.ema21DeltaEma55, e.ema55DeltaEma144) === 'long'),
                pageIndex: 1,
                pageSize: 10
              }
            }
          ]
        },
        error: (err: Error) => {
          this.tabsLoading = false;
          this.notification.error(`获取价格形态数据失败`, `${err.message}`)
        }
      })
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

  private loadData() {
    this.loading = true;

    const intervals = 30 * this.resolveCountPerDay();
    const startTime = this.resolveTime(intervals);
    const endTime = new Date().getTime();
    this.fetchDataByTime(startTime, endTime)
      .subscribe({
        next: (items: CexTokenDaily[]) => {
          this.loading = false;
          this.data = this.convertData(items);
          this.colors = [
            'rgb(203, 24, 29)',
            'rgb(224, 224, 224)',
            'rgb(35, 139, 69)'
          ]
        },
        error: (err: Error) => {
          this.loading = false;
          this.notification.error(`获取价格形态数据失败`, `${err.message}`)
        }
      })

  }

  private fetchDataByTime(startTime: number, endTime: number): Observable<CexTokenDaily[]> {
    return this.cexTokenDailyService.queryList({
      time: {
        $gte: startTime,
        $lt: endTime
      },
      interval: this.interval,
      ...(this.tag === tokenTagNameOfTotalMarket ? {} : {
        tags: this.tag
      })
    })
  }

  private resolveTime(intervals: number): number {
    switch (this.interval) {
      case KlineIntervals.FOUR_HOURS:
        return this.klineInterval.resolveFourHoursIntervalMills(intervals);
      case KlineIntervals.ONE_DAY:
        return this.klineInterval.resolveOneDayIntervalMills(intervals);
      default:
        this.notification.error(`未知 kline时间周期`, `CexTokenPriceStatusChartComponent resolveTime() 未知interval: ${this.interval}`)
        return this.klineInterval.resolveFourHoursIntervalMills(intervals);
    }
  }

  private resolveCountPerDay(): number {
    switch (this.interval) {
      case KlineIntervals.FOUR_HOURS:
        return 6;
      case KlineIntervals.ONE_DAY:
        return 1;
      default:
        this.notification.error(`未知 kline时间周期`, `CexTokenPriceStatusChartComponent resolveCountPerDay() 未知interval: ${this.interval}`)
        return 1;
    }
  }

  private convertData(items: CexTokenDaily[]): Array<{
    time: string;
    type: string;
    value: number;
  }> {
    const sortedItems = items.sort((a, b) => a.time - b.time);
    const times = Array.from(new Set(sortedItems.map(e => e.time)));

    const results: Array<{
      time: string;
      type: string;
      value: number;
    }> = []

    for (const time of times) {
      results.push({
        time: format(time, 'MM dd HH:mm'),
        type: 'short',
        value: sortedItems.filter(e => e.time === time && resolvePriceStatus(e.closeDeltaEma21, e.ema21DeltaEma55, e.ema55DeltaEma144) === 'short').length
      })

      results.push({
        time: format(time, 'MM dd HH:mm'),
        type: 'shock',
        value: sortedItems.filter(e => e.time === time && resolvePriceStatus(e.closeDeltaEma21, e.ema21DeltaEma55, e.ema55DeltaEma144) === 'shock').length
      })

      results.push({
        time: format(time, 'MM dd HH:mm'),
        type: 'long',
        value: sortedItems.filter(e => e.time === time && resolvePriceStatus(e.closeDeltaEma21, e.ema21DeltaEma55, e.ema55DeltaEma144) === 'long').length
      })
    }
    return results
  }
}