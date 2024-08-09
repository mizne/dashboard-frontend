import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChange, CexTokenPriceChangeService, KlineIntervalService } from 'src/app/shared';
import { removeEmpty, stringifyNumber } from 'src/app/utils';
import { lastValueFrom } from 'rxjs';
import { format, parse } from 'date-fns';

@Component({
  selector: 'market-overview-chart',
  templateUrl: 'market-overview-chart.component.html'
})
export class MarketOverviewChartComponent implements OnInit, OnDestroy {
  constructor(
    private readonly cexTokenPriceChangeService: CexTokenPriceChangeService,
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

  timeRanges = {
    '最近一个月': [new Date(new Date().getTime() - 1 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近三个月': [new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近半年': [new Date(new Date().getTime() - 6 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近一年': [new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1e3), new Date()],
  }

  data: Array<{
    label: string;
    value1: number;
    value2: number;
    value3: number;
  }> = [];

  alias = {
    label: 'Symbol',
    value1: '涨跌幅',
    value2: '当前价位',
    value3: '市值'
  }


  formatter = {
    label: (value: number) => {
      return value
    },
    value1: (value: number) => {
      return `${(value * 100).toFixed(3)}%`
    },
    value2: (value: number) => {
      return `${(value).toFixed(3)}`
    },
    value3: (value: number) => {
      return stringifyNumber(value)
    }
  }

  min = {
    value1: -1,
    value2: 0,
    value3: 0
  }
  max = {
    value2: 1,
  }
  tickInterval = {
    value1: 1
  }

  styleKey = 'value1'
  styleCallback = (val: any) => {
    return {
      lineWidth: 1,
      strokeOpacity: 1,
      fillOpacity: 0.3,
      opacity: 0.65,
      fill: val > 0 ? '#50C878' : '#FE6F5E'
    };
  }
  annotation = ''
  animateDuration = 2e3
  timer: any = 0
  pauseTimer = false
  showPauseTimer = false


  loading = false;


  form = this.fb.group({
    inDays: [90],
    timeDateRange: [[]],
    symbol: [[]],
    listingTimeDateRange: [[]],
  });
  listingTimeRanges = {
    '最近一个月': [new Date(new Date().getTime() - 1 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近三个月': [new Date(new Date().getTime() - 3 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近半年': [new Date(new Date().getTime() - 6 * 30 * 24 * 60 * 60 * 1e3), new Date()],
    '最近一年': [new Date(new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1e3), new Date()],
  }

  submitForm(): void {
    const timeDateRange = this.form.get('timeDateRange')?.value;
    if (timeDateRange && timeDateRange.length === 2) {
      if (this.timer) {
        clearInterval(this.timer as number)
        this.timer = 0;
      }
      this.pauseTimer = false
      this.showPauseTimer = true
      this.loadAnimateBubbleChartData();
    } else {
      if (this.timer) {
        clearInterval(this.timer as number)
        this.timer = 0;
      }
      this.pauseTimer = false
      this.showPauseTimer = false

      this.loadChartData();
    }
  }

  resetForm() {
    this.form.reset({
      inDays: 90
    });

    if (this.timer) {
      clearInterval(this.timer as number)
      this.timer = 0;
    }
    this.pauseTimer = false
    this.showPauseTimer = false
    this.loadChartData();
  }

  enablePauseTimer() {
    this.pauseTimer = !this.pauseTimer
  }

  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer as number)
      this.timer = 0;
    }
    this.pauseTimer = false
    this.showPauseTimer = true
  }

  private async loadChartData() {
    this.loading = true;
    const inDays = this.form.get('inDays')?.value

    if (inDays) {
      const time = this.klineIntervalService.resolveOneDayIntervalMills(1)
      const items = await lastValueFrom(this.cexTokenPriceChangeService.queryList({
        time,
        ...this.adjustQuery()
      }))

      const endDate = time
      const startDate = endDate - inDays * KlineIntervalService.ONE_DAY_MILLS;
      this.annotation = this.resolveAnnotationText(startDate, endDate)
      this.data = items.map(e => {
        return {
          label: e.symbol,
          value1: e.priceChangePercent,
          value2: e.currentPriceRelative,
          value3: e.marketCap
        }
      })
    }
    this.loading = false;
  }

  private async loadAnimateBubbleChartData() {
    // console.log(`loadAnimateBubbleChartData()`)
    const timeDateRange = this.form.get('timeDateRange')?.value as Date[];
    this.loading = true;
    const firstDate = parse(`${format(timeDateRange[0], 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime();
    const lastDate = parse(`${format(timeDateRange[1], 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime();
    const adjustLastDate = Math.min(lastDate, this.klineIntervalService.resolveOneDayIntervalMills(1))
    const inDays = this.form.get('inDays')?.value as number;
    const count = (adjustLastDate - firstDate) / KlineIntervalService.ONE_DAY_MILLS;

    const chartDatas: Array<{
      startDate: number;
      endDate: number;
      data: CexTokenPriceChange[]
    }> = []

    for (const [index, n] of Array.from({ length: count + 1 }).entries()) {
      const endDate = firstDate + index * KlineIntervalService.ONE_DAY_MILLS;
      const startDate = endDate - inDays * KlineIntervalService.ONE_DAY_MILLS;
      this.annotation = this.resolveAnnotationText(startDate, endDate)
      const data = await (lastValueFrom(this.cexTokenPriceChangeService
        .queryList({ time: endDate, ...this.adjustQuery() })))

      if (data.length > 0) {
        chartDatas.push({
          startDate,
          endDate,
          data
        })
      }
    }

    this.loading = false;

    let timerCount = 0;
    const timerInterval = 4e3
    this.animateDuration = timerInterval - 2e3
    const ticker = () => {
      if (this.pauseTimer) {
        return
      }

      if (timerCount >= chartDatas.length) {
        clearInterval(this.timer as number)
        this.timer = 0;
        this.showPauseTimer = false;
        this.pauseTimer = false;
        return
      }

      // console.log(`timer bubble chart data, start date: ${format(chartDatas[timerCount].startDate, 'yyyy-MM-dd')}`)

      this.annotation = this.resolveAnnotationText(chartDatas[timerCount].startDate, chartDatas[timerCount].endDate)
      this.data = chartDatas[timerCount].data.map(e => {
        return {
          label: e.symbol,
          value1: e.priceChangePercent,
          value2: e.currentPriceRelative,
          value3: e.marketCap
        }
      })

      timerCount += 1;
    }
    this.timer = setInterval(ticker, timerInterval)

    ticker()
  }

  private resolveAnnotationText(startDate: number, endDate: number): string {
    const startYear = new Date(startDate).getFullYear()
    const endYear = new Date(endDate).getFullYear()

    if (startYear === endYear) {
      return `${format(startDate, 'yyyy-MM-dd')} ~ ${format(endDate, 'MM-dd')}`
    }
    return `${format(startDate, 'yyyy-MM-dd')} ~ ${format(endDate, 'yyyy-MM-dd')}`
  }

  private adjustQuery(): { [key: string]: any } {
    // MARK: 
    const formValue = this.form.value;
    const o: { [key: string]: any } = {};
    Object.keys(formValue).forEach((key) => {
      if (key === 'symbol' && formValue['symbol'] && formValue['symbol'].length > 0) {
        Object.assign(o, { symbol: { $in: formValue['symbol'] } })
      }

      if (key === 'inDays' && typeof formValue['inDays'] === 'number') {
        Object.assign(o, { inDays: formValue['inDays'] })
      }

      if (key === 'listingTimeDateRange' && formValue['listingTimeDateRange'] && formValue['listingTimeDateRange'].length === 2) {
        Object.assign(o, {
          listingTime: {
            $gte: new Date(formValue['listingTimeDateRange'][0]).getTime(),
            $lte: new Date(formValue['listingTimeDateRange'][1]).getTime(),
          }
        })
      }
    });
    return o;
  }




}