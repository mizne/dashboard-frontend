import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChange, CexTokenPriceChangeService, KlineIntervalService, MarketRequest } from 'src/app/shared';
import { colors, removeEmpty, stringifyNumber } from 'src/app/utils';
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
    '最近7天': [new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1e3), new Date()],
    '最近15天': [new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1e3), new Date()],
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
    color?: string;
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

  styleKey = 'value1*color'
  styleCallback = (value1Val: number, colorVal: string) => {
    if (colorVal) {
      return {
        lineWidth: 1,
        strokeOpacity: 1,
        fillOpacity: 0.3,
        opacity: 0.65,
        fill: colorVal
      }
    } else {
      return {
        lineWidth: 1,
        strokeOpacity: 1,
        fillOpacity: 0.3,
        opacity: 0.65,
        fill: value1Val > 0 ? '#50C878' : '#FE6F5E'
      }
    }
  }
  annotation = ''
  animateDuration = 2e3
  timer: any = 0
  pauseTimer = false
  showPauseTimer = false
  speed = 1;
  minSpeed = 0.25;
  maxSpeed = 2;


  loading = false;

  defaultInDays = 180;
  form = this.fb.group({
    inDays: [this.defaultInDays],
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

  alertMessage = 'x轴表示涨跌幅, y轴表示当前价位, 气泡大小表示市值大小, 红色表示涨跌幅为负, 绿色表示涨跌幅为正'

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
      inDays: this.defaultInDays
    });

    if (this.timer) {
      clearInterval(this.timer as number)
      this.timer = 0;
    }
    this.pauseTimer = false
    this.showPauseTimer = false
    this.speed = 1;
    this.loadChartData();
  }

  enablePauseTimer() {
    this.pauseTimer = !this.pauseTimer
  }

  speedUp() {
    if (this.speed >= this.maxSpeed) {
      this.notification.warning(`已经最大速度 ${this.maxSpeed}`, `已经最大速度 ${this.maxSpeed}`)
      return
    }

    this.speed = 2 * this.speed;
    this.notification.info(`当前速度 ${this.speed}`, `最大速度 ${this.maxSpeed}`)
  }

  speedDown() {
    if (this.speed <= this.minSpeed) {
      this.notification.warning(`已经最小速度 ${this.minSpeed}`, `已经最小速度 ${this.minSpeed}`)
      return
    }

    this.speed = 0.5 * this.speed;
    this.notification.info(`当前速度 ${this.speed}`, `最小速度 ${this.minSpeed}`)
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

    const hasSelectSymbols = this.form.value.symbol && this.form.value.symbol.length > 0

    if (inDays) {
      const time = this.klineIntervalService.resolveOneDayIntervalMills(1)
      const items = await lastValueFrom(this.cexTokenPriceChangeService.queryList({
        time,
        ...this.adjustQuery()
      }))

      const endDate = time
      const startDate = endDate - inDays * KlineIntervalService.ONE_DAY_MILLS;
      this.annotation = this.resolveAnnotationText(startDate, endDate)
      this.data = items.map((e, i) => {
        return {
          label: e.symbol,
          value1: e.priceChangePercent,
          value2: e.currentPriceRelative,
          value3: e.marketCap,
          ...(hasSelectSymbols ? {
            color: colors[i % colors.length]
          } : {})
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

    let dataCount = 0;
    let tickerCount = 0;
    const base = 4;
    const timerInterval = 1e3 * base / this.maxSpeed;
    this.animateDuration = 0.5 * base * 1 / this.speed
    const ticker = () => {
      // 执行前判断 速度
      const n = this.maxSpeed / this.speed;
      if (tickerCount % n !== 0) {
        tickerCount += 1;
        return
      }

      tickerCount += 1;
      if (this.pauseTimer) {
        return
      }

      if (dataCount >= chartDatas.length) {
        clearInterval(this.timer as number)
        this.timer = 0;
        this.showPauseTimer = false;
        this.pauseTimer = false;
        return
      }

      // console.log(`timer bubble chart data, start date: ${format(chartDatas[dataCount].startDate, 'yyyy-MM-dd')}`)

      this.annotation = this.resolveAnnotationText(chartDatas[dataCount].startDate, chartDatas[dataCount].endDate)
      const hasSelectSymbols = this.form.value.symbol && this.form.value.symbol.length > 0
      this.data = chartDatas[dataCount].data.map((e, i) => {
        return {
          label: e.symbol,
          value1: e.priceChangePercent,
          value2: e.currentPriceRelative,
          value3: e.marketCap,
          ...(hasSelectSymbols ? {
            color: colors[i % colors.length]
          } : {})
        }
      })

      dataCount += 1;
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