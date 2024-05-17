import { Component, OnInit } from '@angular/core';
import { CexFutureDaily, CexFutureDailyService, KlineIntervalService, TimerService, filterLegendType, normalizeLegendType } from 'src/app/shared';
import { Observable, map, merge, startWith } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';
import { Legend } from 'src/app/shared';
import { FormBuilder } from '@angular/forms';
import { group } from 'src/app/utils';

@Component({
  selector: 'cex-future-fundingrate-chart',
  templateUrl: 'cex-future-fundingrate-chart.component.html'
})
export class CexFutureFundingrateChartComponent implements OnInit {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private readonly timerService: TimerService,
  ) { }

  title = '资金费率分布';
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = [];

  legends: Array<Legend> = [
    {
      type: {
        lte: -0.0005
      },
      color: 'rgb(203, 24, 29)'
    },
    {
      type: {
        gt: -0.0005,
        lte: -0.0001
      },
      color: 'rgb(252, 187, 161)'
    },
    {
      type: {
        gt: -0.0001,
        lte: 0.0001
      },
      color: 'rgb(224, 224, 224)'
    },
    {
      type: {
        gt: 0.0001,
        lte: 0.0005
      },
      color: 'rgb(199, 233, 192)'
    },
    {
      type: {
        gt: 0.0005,
      },
      color: 'rgb(35, 139, 69)'
    }
  ]

  loading = false;

  visible = false;
  tabsLoading = false;
  tabs: Array<{
    label: string;
    color: string;
    table: {
      list: CexFutureDaily[];
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

  fundingRateCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.fundingRate - b.fundingRate
  longShortRatioCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.longShortRatio - b.longShortRatio
  timeCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.time - b.time
  createdAtCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.createdAt - b.createdAt

  monthModalVisible = false;
  monthModalTitle = '';
  monthModalLoading = false;
  monthModalData: Array<Array<{ time: string; type: string; value: number }>> = [];
  monthModalColors: string[] = [];

  ngOnInit() {
    this.loading = true;
    const intervals = 15 * 6;
    this.fetchData(intervals)
      .subscribe({
        next: (items: CexFutureDaily[]) => {
          this.loading = false;
          this.data = this.convertData(items);
          this.colors = this.legends.map(e => e.color);
        },
        error: (err: Error) => {
          this.loading = false;
          this.notification.error(`获取资金费率合约数据失败`, `${err.message}`)
        }
      })
  }

  openModal(months: number) {
    this.monthModalVisible = true;
    this.monthModalTitle = `最近 ${months} 个月资金费率`;

    this.monthModalLoading = true;

    const intervals = months * 30 * 6;
    this.fetchData(intervals)
      .subscribe({
        next: (items: CexFutureDaily[]) => {
          this.monthModalLoading = false;

          const totalItems = this.convertData(items)
          this.monthModalData = group(totalItems, totalItems.length / (months * 2));
          this.monthModalColors = this.legends.map(e => e.color);
        },
        error: (err: Error) => {
          this.monthModalLoading = false;
          this.notification.error(`获取资金费率合约数据失败`, `${err.message}`)
        }
      })
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

    this.cexFutureDailyService.queryList({
      time: this.klineInterval.resolveFourHoursIntervalMills(this.form.get('latestIntervals')?.value as number),
    }, undefined, {
      createdAt: 1
    })
      .subscribe({
        next: (items: CexFutureDaily[]) => {
          this.tabsLoading = false;
          this.tabs = legendPres.map(e => {
            return {
              label: e.type,
              color: e.color,
              table: {
                list: items.filter(f => e.predicate(f.fundingRate)),
                pageIndex: 1,
                pageSize: 10
              }
            }
          })
        },
        error: (err: Error) => {
          this.tabsLoading = false;
          this.notification.error(`获取资金费率合约数据失败`, `${err.message}`)
        }
      })
  }

  private fetchData(intervals: number): Observable<CexFutureDaily[]> {
    const time = this.klineInterval.resolveFourHoursIntervalMills(intervals);

    return this.cexFutureDailyService.queryList({
      time: {
        $gte: time
      }
    })
  }

  private convertData(items: CexFutureDaily[]): Array<{
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
          time: format(time, 'MM dd HH:mm'),
          type: legendPre.type,
          value: sortedItems.filter(e => e.time === time && legendPre.predicate(e.fundingRate)).length
        })
      }
    }
    return results
  }
}