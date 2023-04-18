import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CexTokenDaily, CexTokenDailyService, KlineIntervalService, KlineIntervals, TimerService, filterLegendType, normalizeLegendType, tokenTagNameOfTotalMarket } from 'src/app/shared';
import { Observable, map, merge, startWith } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';
import { Legend } from 'src/app/shared';
import { FormBuilder } from '@angular/forms';



@Component({
  selector: 'cex-token-big-volume-chart',
  templateUrl: 'cex-token-big-volume-chart.component.html'
})

export class CexTokenBigVolumeChartComponent implements OnInit, OnChanges {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexTokenDailyService: CexTokenDailyService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private readonly timerService: TimerService,
  ) { }

  @Input() tag: string = '';
  @Input() interval: KlineIntervals = KlineIntervals.FOUR_HOURS

  title = '交易量暴增分布';
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = [];

  legends: Array<Legend> = [
    {
      type: {
        lte: 0.8
      },
      color: 'rgb(247, 251, 255)'
    },
    {
      type: {
        gt: 0.8,
        lte: 1
      },
      color: 'rgb(198, 219, 239)'
    },
    {
      type: {
        gt: 1,
        lte: 3
      },
      color: 'rgb(107, 174, 214)'
    },
    {
      type: {
        gt: 3,
        lte: 10
      },
      color: 'rgb(33, 113, 181)'
    },
    {
      type: {
        gt: 10,
      },
      color: 'rgb(8, 48, 107)'
    }
  ]

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


  ngOnInit() {
    // this.loadData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadData()
  }

  open() {
    this.visible = true;

    this.fetchTabs();
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

    const legendPres = this.legends.map(e => {
      return {
        type: normalizeLegendType(e),
        color: e.color,
        predicate: filterLegendType(e)
      }
    })

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
          this.tabs = legendPres.map(e => {
            return {
              label: e.type,
              color: e.color,
              table: {
                list: items.filter(f => e.predicate(f.volumeMultiple)),
                pageIndex: 1,
                pageSize: 10
              }
            }
          })
        },
        error: (err: Error) => {
          this.tabsLoading = false;
          this.notification.error(`获取交易量暴增数据失败`, `${err.message}`)
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
    const intervals = 5 * 6;
    this.fetchData(intervals)
      .subscribe({
        next: (items: CexTokenDaily[]) => {
          this.loading = false;
          this.data = this.convertData(items);
          this.colors = this.legends.map(e => e.color);
        },
        error: (err: Error) => {
          this.loading = false;
          this.notification.error(`获取交易量暴增数据失败`, `${err.message}`)
        }
      })
  }

  private fetchData(intervals: number): Observable<CexTokenDaily[]> {
    const time = this.resolveTime(intervals);

    return this.cexTokenDailyService.queryList({
      time: {
        $gte: time
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
        this.notification.error(`未知 kline时间周期`, `CexTokenBigVolumeChartComponent resolveTime() 未知interval: ${this.interval}`)
        return this.klineInterval.resolveFourHoursIntervalMills(intervals);
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

    const legendPres = this.legends.map(e => {
      return {
        type: normalizeLegendType(e),
        predicate: filterLegendType(e)
      }
    })

    for (const time of times) {
      for (const legendPre of legendPres) {
        results.push({
          time: format(time, 'dd HH:mm'),
          type: legendPre.type,
          value: sortedItems.filter(e => e.time === time && legendPre.predicate(e.volumeMultiple)).length
        })
      }
    }
    return results
  }
}