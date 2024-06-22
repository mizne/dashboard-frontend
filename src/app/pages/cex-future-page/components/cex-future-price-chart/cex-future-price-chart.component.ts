import { Component, OnInit } from '@angular/core';
import { CexFutureDaily, CexFutureDailyService, KlineIntervalService, Legend, TimerService, filterLegendType, normalizeLegendType } from 'src/app/shared';
import { Observable, lastValueFrom, map, merge, startWith } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'cex-future-price-chart',
  templateUrl: 'cex-future-price-chart.component.html'
})
export class CexFuturePriceChartComponent implements OnInit {
  constructor(
    private klineInterval: KlineIntervalService,
    private cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private readonly timerService: TimerService,
  ) { }

  title = '价格相对分布';
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = []

  relativeCtrl = new FormControl(21)
  relatives = [
    {
      label: '21周期',
      value: 21,
    },
    {
      label: '55周期',
      value: 55,
    },
    {
      label: '144周期',
      value: 144,
    },
    // {
    //   label: '377周期',
    //   value: 377,
    // }
  ]

  legends: Array<Legend> = [
    {
      type: {
        gte: 0,
        lt: 0.2
      },
      color: 'rgb(203, 24, 29)'
    },
    {
      type: {
        gte: 0.2,
        lt: 0.4
      },
      color: 'rgb(252, 187, 161)'
    },
    {
      type: {
        gte: 0.4,
        lt: 0.6
      },
      color: 'rgb(224, 224, 224)'
    },
    {
      type: {
        gte: 0.6,
        lt: 0.8
      },
      color: 'rgb(199, 233, 192)'
    },
    {
      type: {
        gte: 0.8,
        lte: 1
      },
      color: 'rgb(35, 139, 69)'
    }
  ]
  loading = false;

  visible = false;
  detailModalTitle = `全部 - 价格相对 分类`

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
  priceBetweenMinMaxRelative21Compare = (a: CexFutureDaily, b: CexFutureDaily) => a.priceBetweenMinMaxRelative21 - b.priceBetweenMinMaxRelative21
  priceBetweenMinMaxRelative55Compare = (a: CexFutureDaily, b: CexFutureDaily) => a.priceBetweenMinMaxRelative55 - b.priceBetweenMinMaxRelative55
  priceBetweenMinMaxRelative144Compare = (a: CexFutureDaily, b: CexFutureDaily) => a.priceBetweenMinMaxRelative144 - b.priceBetweenMinMaxRelative144
  // priceBetweenMinMaxRelative377Compare = (a: CexFutureDaily, b: CexFutureDaily) => a.priceBetweenMinMaxRelative377 - b.priceBetweenMinMaxRelative377
  timeCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.time - b.time
  createdAtCompare = (a: CexFutureDaily, b: CexFutureDaily) => a.createdAt - b.createdAt

  monthModalVisible = false;
  monthModalTitle = '';
  monthModalLoading = false;
  monthModalData: Array<Array<{ time: string; type: string; value: number }>> = [];
  monthModalColors: string[] = [];



  ngOnInit() {
    this.relativeCtrl.valueChanges.pipe(startWith(42)).subscribe(() => {
      this.fetchChartData()
    })
  }

  private fetchChartData() {
    this.loading = true;
    const intervals = 30 * 6;
    const startTime = this.klineInterval.resolveFourHoursIntervalMills(intervals);
    const endTime = new Date().getTime();
    this.fetchDataByTime(startTime, endTime)
      .subscribe({
        next: (items: CexFutureDaily[]) => {
          this.loading = false;
          this.data = this.convertData(items);
          this.colors = this.legends.map(e => e.color);
        },
        error: (err: Error) => {
          this.loading = false;
          this.notification.error(`获取价格相对合约数据失败`, `${err.message}`)
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
    this.monthModalTitle = `最近 ${months} 个月价格相对 ${this.relativeCtrl.value}周期`;

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
        this.notification.error(`获取价格相对合约数据失败`, `${err.message}`)
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
          this.notification.error(`获取价格相对合约数据失败`, `${err.message}`)
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
    switch (this.relativeCtrl.value) {
      case 21:
        return item.priceBetweenMinMaxRelative21;
      case 55:
        return item.priceBetweenMinMaxRelative55;
      case 144:
        return item.priceBetweenMinMaxRelative144;
      // case 377:
      //   return item.priceBetweenMinMaxRelative377;

      default:
        console.log(`[CexFuturePriceChartComponent] resolveRelativeDuration() unknown relativeCtrl value: ${this.relativeCtrl.value}`)
        return item.priceBetweenMinMaxRelative21;
    }
  }
}