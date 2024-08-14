import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChange, CexTokenPriceChangeService, CexTokenPriceChangeStatisticsService, KlineIntervalService, MarketRequest } from 'src/app/shared';
import { removeEmpty, stringifyNumber } from 'src/app/utils';
import { lastValueFrom } from 'rxjs';
import { format, parse } from 'date-fns';

@Component({
  selector: 'history-distribution-chart',
  templateUrl: 'history-distribution-chart.component.html'
})
export class HistoryDistributionChartComponent implements OnInit, OnDestroy {
  constructor(
    private readonly cexTokenPriceChangeStatisticsService: CexTokenPriceChangeStatisticsService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder,
    private readonly klineIntervalService: KlineIntervalService
  ) { }

  // [3, 7, 15, 30, 60, 90, 180, 360, 540];
  inDayss = [
    {
      label: '3',
      name: 3,
    },
    {
      label: '7',
      name: 7,
    },
    {
      label: '15',
      name: 15,
    },
    {
      label: '30',
      name: 30,
    },
    {
      label: '60',
      name: 60,
    },
    {
      label: '90',
      name: 90,
    },
    {
      label: '180',
      name: 180,
    },
    {
      label: '360',
      name: 360,
    },
    {
      label: '540',
      name: 540,
    },
  ];

  priceRelativeDistributionChartData: Array<{
    label: string; value: number; color?: string
  }> = []

  priceChangePercentDistributionChartData: Array<{
    label: string; value: number; color?: string
  }> = []


  loading = false;

  defaultInDays = 180;
  form = this.fb.group({
    inDays: [this.defaultInDays],
    time: [new Date(this.klineIntervalService.resolveOneDayIntervalMills(1))]
  });

  alertMessage1 = '平均当前价位的历史分布图'
  lowestAvgPriceRelativeDesc = '--';
  highestAvgPriceRelativeDesc = '--';
  theMomentAvgPriceRelativeDesc = '--';
  loadingAvgPriceRelativeDesc = false;


  alertMessage2 = '平均涨跌幅的历史分布图'
  lowestAvgPricePercentDesc = '--';
  highestAvgPricePercentDesc = '--';
  theMomentAvgPricePercentDesc = '--';
  loadingAvgPricePercentDesc = false;

  submitForm(): void {
    this.loadChartData()
  }

  resetForm() {
    this.form.reset({
      inDays: this.defaultInDays,
      time: new Date(this.klineIntervalService.resolveOneDayIntervalMills(1))
    });

    this.loadChartData()
  }



  ngOnInit(): void {
    this.loadChartData()
  }

  ngOnDestroy(): void {
  }

  private loadChartData() {
    this.loadPriceRelativeChartData();
    this.loadPriceChangePercentChartData();

    this.loadAvgPriceRelativeDesc();
    this.loadAvgPricePercentDesc();
  }

  ensureSelectTime(time: number) {
    this.form.patchValue({ time: new Date(time) })
    this.loadChartData()
  }

  private async loadPriceRelativeChartData() {
    this.loading = true;
    const inDays = this.form.get('inDays')?.value

    if (inDays) {
      const interval = 0.01;
      const max = 1;
      let start = 0;
      const chartData: Array<{
        label: string;
        value: number;
        color?: string;
      }> = []

      const theAvgPriceRelative = await this.resolveTheTimeAvgPriceRelative(inDays)

      for (; ;) {
        if (start > max) {
          break;
        }
        const count = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryCount({
          inDays,
          avgCurrentPriceRelative: {
            $gte: start,
            $lt: start + interval
          }
        }))
        if (count > 0) {
          chartData.push({
            label: `[${start.toFixed(2)}, ${(start + interval).toFixed(2)})`,
            value: count,
            color: (typeof theAvgPriceRelative === 'number' && (theAvgPriceRelative >= start) && theAvgPriceRelative < (start + interval)) ? '#FE6F5E' : '#063d8a'
          })
        }

        start += interval;
      }


      this.priceRelativeDistributionChartData = chartData
    }
    this.loading = false;
  }

  private async resolveTheTimeAvgPriceRelative(inDays: number): Promise<null | number> {
    const time = this.form.get('time')?.value;

    if (time) {
      const the = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({
        inDays, time: parse(`${format(time, 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime()
      }))
      if (the.length > 0) {
        return the[0].avgCurrentPriceRelative
      }
      return null
    } else {
      return null
    }
  }


  private async loadPriceChangePercentChartData() {
    this.loading = true;
    const inDays = this.form.get('inDays')?.value

    if (inDays) {
      const { start, interval, max } = await this.resolveInterval(inDays)
      console.log(`loadPriceChangePercentChartData() ${inDays}天 start: ${start.toFixed(3)}, interval: ${interval.toFixed(3)}, max: ${max.toFixed(3)}`)

      let _start = start;
      const chartData: Array<{
        label: string;
        value: number;
        color?: string;
      }> = []

      const theAvgPriceChangePercent = await this.resolveTheTimeAvgPriceChangePercent(inDays)

      for (; ;) {
        if (_start > max) {
          break;
        }
        const count = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryCount({
          inDays,
          avgPriceChangePercent: {
            $gte: _start,
            $lt: _start + interval
          }
        }))
        if (count > 0) {
          chartData.push({
            label: `[${_start.toFixed(2)}, ${(_start + interval).toFixed(2)})`,
            value: count,
            color: (typeof theAvgPriceChangePercent === 'number' && (theAvgPriceChangePercent >= _start) && theAvgPriceChangePercent < (_start + interval)) ? '#FE6F5E' : '#063d8a'
          })
        }

        _start += interval;
      }


      this.priceChangePercentDistributionChartData = chartData
    }
    this.loading = false;
  }

  private async resolveInterval(inDays: number): Promise<{ start: number; interval: number; max: number }> {
    const minItems = await (lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({ inDays }, { number: 1, size: 1 }, { avgPriceChangePercent: 1 })))

    const maxItems = await (lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({ inDays }, { number: 1, size: 1 }, { avgPriceChangePercent: -1 })))

    if (minItems.length === 0 || maxItems.length === 0) {
      this.notification.warning(`没有找到最小、最大涨跌幅`, `没有找到最小、最大涨跌幅`)
      throw new Error(`没有找到最小、最大涨跌幅`)
    }

    const min = minItems[0].avgPriceChangePercent;
    const max = maxItems[0].avgPriceChangePercent;

    const interval = Math.ceil(max - min) / 100

    return {
      start: this.findStart(-1, interval, min),
      interval: interval,
      max: max + interval
    }
  }

  private findStart(begin: number, interval: number, dest: number): number {
    if (dest < begin) {
      return begin
    }

    let i = begin;
    for (; ;) {
      if (dest >= i && dest < (i + interval)) {
        return i
      }

      i += interval;
    }
  }


  private async resolveTheTimeAvgPriceChangePercent(inDays: number): Promise<null | number> {
    const time = this.form.get('time')?.value;

    if (time) {
      const the = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({
        inDays, time: parse(`${format(time, 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime()
      }))
      if (the.length > 0) {
        return the[0].avgPriceChangePercent
      }
      return null
    } else {
      return null
    }
  }

  private async loadAvgPriceRelativeDesc() {
    const inDays = this.form.get('inDays')?.value;
    this.loadingAvgPriceRelativeDesc = true;
    if (inDays) {
      const lowestItems = await (lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({ inDays }, { number: 1, size: 1 }, {
        avgCurrentPriceRelative: 1
      })));
      if (lowestItems.length > 0) {
        this.lowestAvgPriceRelativeDesc = `${format(lowestItems[0].time, 'yyyy-MM-dd')} | ${lowestItems[0].avgCurrentPriceRelative.toFixed(3)}`
      } else {
        this.lowestAvgPriceRelativeDesc = `没有找到数据`
      }


      const highestItems = await (lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({ inDays }, { number: 1, size: 1 }, {
        avgCurrentPriceRelative: -1
      })));
      if (highestItems.length > 0) {
        this.highestAvgPriceRelativeDesc = `${format(highestItems[0].time, 'yyyy-MM-dd')} | ${highestItems[0].avgCurrentPriceRelative.toFixed(3)}`
      } else {
        this.highestAvgPriceRelativeDesc = `没有找到数据`
      }


      const time = this.form.get('time')?.value;
      if (time) {
        this.theMomentAvgPriceRelativeDesc = await this.loadTheMomentAvgPriceRelativeDesc(inDays, time)
      } else {
        this.theMomentAvgPriceRelativeDesc = `没有选择`
      }
    }

    this.loadingAvgPriceRelativeDesc = false
  }

  private async loadTheMomentAvgPriceRelativeDesc(inDays: number, time: Date): Promise<string> {
    const timeMills = parse(`${format(time, 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime()
    const the = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({
      inDays, time: timeMills
    }))
    if (the.length > 0) {
      const theAvg = the[0].avgCurrentPriceRelative;

      const totalCount = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryCount({ inDays }));
      const lowerThanThe = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryCount({ inDays, avgCurrentPriceRelative: { $lt: theAvg } }));

      if (lowerThanThe <= 0.05 * totalCount) {
        return `${format(timeMills, 'yyyy-MM-dd')} | ${theAvg.toFixed(3)} ` + (lowerThanThe === 0 ? `历史最低时刻` : `比它低的时刻数 ${lowerThanThe}/${totalCount}`)
      } else if (lowerThanThe >= 0.95 * totalCount) {
        return `${format(timeMills, 'yyyy-MM-dd')} | ${theAvg.toFixed(3)} ` + (totalCount - lowerThanThe === 1 ? `历史最高时刻` : `比它高的时刻数 ${totalCount - lowerThanThe}/${totalCount}`)
      } else {
        return `${format(timeMills, 'yyyy-MM-dd')} | ${theAvg.toFixed(3)}`
      }

    } else {
      return `没有找到某个时刻数据`
    }
  }






  private async loadAvgPricePercentDesc() {
    const inDays = this.form.get('inDays')?.value;
    this.loadingAvgPricePercentDesc = true;
    if (inDays) {
      const lowestItems = await (lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({ inDays }, { number: 1, size: 1 }, {
        avgPriceChangePercent: 1
      })));
      if (lowestItems.length > 0) {
        this.lowestAvgPricePercentDesc = `${format(lowestItems[0].time, 'yyyy-MM-dd')} | ${(lowestItems[0].avgPriceChangePercent * 100).toFixed(3)}%`
      } else {
        this.lowestAvgPricePercentDesc = `没有找到数据`
      }


      const highestItems = await (lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({ inDays }, { number: 1, size: 1 }, {
        avgPriceChangePercent: -1
      })));
      if (highestItems.length > 0) {
        this.highestAvgPricePercentDesc = `${format(highestItems[0].time, 'yyyy-MM-dd')} | ${(highestItems[0].avgPriceChangePercent * 100).toFixed(3)}%`
      } else {
        this.highestAvgPricePercentDesc = `没有找到数据`
      }


      const time = this.form.get('time')?.value;
      if (time) {
        this.theMomentAvgPricePercentDesc = await this.loadTheMomentAvgPricePercentDesc(inDays, time)
      } else {
        this.theMomentAvgPricePercentDesc = `没有选择`
      }
    }

    this.loadingAvgPricePercentDesc = false
  }

  private async loadTheMomentAvgPricePercentDesc(inDays: number, time: Date): Promise<string> {
    const timeMills = parse(`${format(time, 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime()
    const the = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryList({
      inDays, time: timeMills
    }))
    if (the.length > 0) {
      const theAvg = the[0].avgPriceChangePercent;

      const totalCount = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryCount({ inDays }));
      const lowerThanThe = await lastValueFrom(this.cexTokenPriceChangeStatisticsService.queryCount({ inDays, avgPriceChangePercent: { $lt: theAvg } }));

      if (lowerThanThe <= 0.05 * totalCount) {
        return `${format(timeMills, 'yyyy-MM-dd')} | ${(theAvg * 100).toFixed(3)}% ` + (lowerThanThe === 0 ? `历史最低时刻` : `比它低的时刻数 ${lowerThanThe}/${totalCount}`)
      } else if (lowerThanThe >= 0.95 * totalCount) {
        return `${format(timeMills, 'yyyy-MM-dd')} | ${(theAvg * 100).toFixed(3)}% ` + (totalCount - lowerThanThe === 1 ? `历史最高时刻` : `比它高的时刻数 ${totalCount - lowerThanThe}/${totalCount}`)
      } else {
        return `${format(timeMills, 'yyyy-MM-dd')} | ${(theAvg * 100).toFixed(3)}%`
      }

    } else {
      return `没有找到某个时刻数据`
    }
  }
}