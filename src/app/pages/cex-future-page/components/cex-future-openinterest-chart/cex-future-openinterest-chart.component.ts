import { Component, OnInit } from '@angular/core';
import { CexFutureDaily, CexFutureDailyService, KlineIntervalService, Legend, TimerService, filterLegendType, normalizeLegendType } from 'src/app/shared';
import { Observable, lastValueFrom, map, merge, startWith } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';
import { FormBuilder, FormControl } from '@angular/forms';
import { sleep } from 'src/app/utils';

@Component({
  selector: 'cex-future-openinterest-chart',
  templateUrl: 'cex-future-openinterest-chart.component.html'
})
export class CexFutureOpeninterestChartComponent implements OnInit {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private readonly timerService: TimerService,
  ) { }

  title = '开仓量相对分布';
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = []
  chartDataItems: CexFutureDaily[] = []

  relativeCtrl = new FormControl(21)
  relatives = [
    {
      label: '21周期',
      value: 21,
    },
    {
      label: '55周期',
      value: 55,
    }
  ]

  legends: Array<Legend> = [
    {
      type: {
        lte: 0.7
      },
      color: 'rgb(203, 24, 29)'
    },
    {
      type: {
        gt: 0.7,
        lte: 1.0
      },
      color: 'rgb(252, 187, 161)'
    },
    {
      type: {
        gt: 1.0,
        lte: 1.5
      },
      color: 'rgb(199, 233, 192)'
    },
    {
      type: {
        gt: 1.5,
      },
      color: 'rgb(35, 139, 69)'
    },
  ]
  loading = false;

  visible = false;
  detailModalTitle = `全部 - 开仓量相对 分类`

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

  oicsRatioCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.openInterestAndCircularSupplyRatio - b.openInterestAndCircularSupplyRatio
  fundingRateCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.fundingRate - b.fundingRate
  longShortRatioCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.longShortRatio - b.longShortRatio
  openInterestRelative21Compare = (a: CexFutureDaily, b: CexFutureDaily) => a.openInterestRelative21 - b.openInterestRelative21
  openInterestRelative55Compare = (a: CexFutureDaily, b: CexFutureDaily) => a.openInterestRelative55 - b.openInterestRelative55
  timeCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.time - b.time
  createdAtCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.createdAt - b.createdAt

  monthModalVisible = false;
  monthModalTitle = '';
  monthModalLoading = false;
  monthModalData: Array<Array<{ time: string; type: string; value: number }>> = [];
  monthModalColors: string[] = [];



  ngOnInit() {
    this.relativeCtrl.valueChanges.subscribe(async () => {
      this.loading = true;
      await sleep(2e2)
      this.data = this.convertData(this.chartDataItems);
      this.loading = false;
    })

    this.fetchChartData()
  }

  private fetchChartData() {
    this.loading = true;
    const intervals = 30 * 6;
    const startTime = this.klineInterval.resolveFourHoursIntervalMills(intervals);
    const endTime = new Date().getTime();
    this.fetchDataByTime(startTime, endTime)
      .subscribe({
        next: (items: CexFutureDaily[]) => {
          this.chartDataItems = items;
          this.loading = false;
          this.data = this.convertData(items);
          this.colors = this.legends.map(e => e.color);
        },
        error: (err: Error) => {
          this.loading = false;
          this.notification.error(`获取开仓量相对合约数据失败`, `${err.message}`)
        }
      })
  }

  async openModal(months: number) {
    if (months <= 1) {
      this.notification.warning(`最少查询 2 个月`, `最少查询 2 个月`)
      return
    }
    this.monthModalData = [];
    this.monthModalVisible = true;
    this.monthModalTitle = `最近 ${months} 个月开仓量相对 ${this.relativeCtrl.value}周期`;

    for (let i = months; i >= 1; i -= 1) {
      this.monthModalLoading = true;
      let startTime = this.klineInterval.resolveFourHoursIntervalMills(i * 30 * 6);
      let endTime = i === 1 ? new Date().getTime() : this.klineInterval.resolveFourHoursIntervalMills((i - 1) * 30 * 6);

      try {
        const items = await lastValueFrom(this.fetchDataByTime(startTime, endTime));
        this.monthModalLoading = false;

        const totalItems = this.convertData(items)
        this.monthModalData.push(totalItems);
        this.monthModalColors = this.legends.map(e => e.color);
      } catch (err: any) {
        this.monthModalLoading = false;
        this.notification.error(`获取开仓量相对合约数据失败`, `${err.message}`)
      }
    }
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
                list: items.filter(f => e.predicate(this.resolveRelativeDuration(f))),
                pageIndex: 1,
                pageSize: 10
              }
            }
          })
        },
        error: (err: Error) => {
          this.tabsLoading = false;
          this.notification.error(`获取开仓量相对合约数据失败`, `${err.message}`)
        }
      })
  }

  private fetchDataByTime(startTime: number, endTime: number): Observable<CexFutureDaily[]> {
    return this.cexFutureDailyService.queryList({
      time: {
        $gte: startTime,
        $lt: endTime
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
          value: sortedItems.filter(e => e.time === time && legendPre.predicate(this.resolveRelativeDuration(e))).length
        })
      }
    }
    return results
  }

  private resolveRelativeDuration(item: CexFutureDaily): number {
    return this.relativeCtrl.value === 21 ? item.openInterestRelative21 : item.openInterestRelative55
  }
}