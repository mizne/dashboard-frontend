import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexFutureDaily, CexFutureDailyService, CexTokenPriceChange, CexTokenPriceChangeService, KlineIntervalService } from 'src/app/shared';
import { removeEmpty, stringifyNumber } from 'src/app/utils';
import { lastValueFrom } from 'rxjs';
import { format, parse } from 'date-fns';

@Component({
  selector: 'cex-future-chart',
  templateUrl: 'cex-future-chart.component.html'
})
export class CexFutureChartComponent implements OnInit, OnDestroy {
  constructor(
    private readonly cexFutureDailyService: CexFutureDailyService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder,
    private readonly klineIntervalService: KlineIntervalService
  ) { }



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
  }> = [];

  alias = {
    label: 'Symbol',
    value1: '多空比',
    value2: '资金费率',
    value3: '未平仓合约'
  }


  formatter = {
    label: (value: number) => {
      return value
    },
    value1: (value: number) => {
      return `${(value).toFixed(3)}`
    },
    value2: (value: number) => {
      return `${(value * 100).toFixed(3)}%`
    },
    value3: (value: number) => {
      return stringifyNumber(value)
    }
  }

  min = {
    value1: 0,
    value2: -0.0025,
    value3: 0
  }
  max = {
    value1: 10,
    value2: 0.0025,
  }
  tickInterval = {
    value1: 1
  }

  styleKey = 'value2'
  styleCallback = (val: any) => {
    return {
      lineWidth: 1,
      strokeOpacity: 1,
      fillOpacity: 0.3,
      opacity: 0.65,
      fill: val >= 0.0001 ? '#50C878' : '#FE6F5E'
    };
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


  form = this.fb.group({
    timeDateRange: [[]],
    symbol: [[]],
  });


  alertMessage = 'x轴表示多空比, y轴表示资金费率, 气泡大小表示未平仓合约大小, 红色表示资金费率小于0.0001, 绿色表示资金费率大于等于0.0001'

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

    const time = this.klineIntervalService.resolveFourHoursIntervalMills(1)
    const items = await lastValueFrom(this.cexFutureDailyService.queryList({
      time,
      ...this.adjustQuery()
    }))

    const endDate = time
    this.annotation = this.resolveAnnotationText(endDate)
    this.data = items.map(e => {
      return {
        label: e.symbol,
        value1: e.longShortRatio,
        value2: e.fundingRate,
        value3: typeof e.price === 'number' ? e.openInterest * e.price : e.openInterest
      }
    })
    this.loading = false;
  }

  private async loadAnimateBubbleChartData() {
    // console.log(`loadAnimateBubbleChartData()`)
    const timeDateRange = this.form.get('timeDateRange')?.value as Date[];
    this.loading = true;
    const firstDate = parse(`${format(timeDateRange[0], 'yyyy-MM-dd')} 00:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime();
    const lastDate = parse(`${format(timeDateRange[1], 'yyyy-MM-dd')} 00:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime() + KlineIntervalService.ONE_DAY_MILLS;
    const adjustLastDate = Math.min(lastDate, this.klineIntervalService.resolveFourHoursIntervalMills(1))
    const count = (adjustLastDate - firstDate) / KlineIntervalService.FOUR_HOURS_MILLS;

    const chartDatas: Array<{
      endDate: number;
      data: CexFutureDaily[]
    }> = []

    for (const [index, n] of Array.from({ length: count + 1 }).entries()) {
      const endDate = firstDate + index * KlineIntervalService.FOUR_HOURS_MILLS;
      this.annotation = this.resolveAnnotationText(endDate)
      const data = await (lastValueFrom(this.cexFutureDailyService
        .queryList({ time: endDate, ...this.adjustQuery() })))

      if (data.length > 0) {
        chartDatas.push({
          endDate,
          data
        })
      }
    }

    this.loading = false;

    let dataCount = 0;
    let tickerCount = 0;
    const base = 2;
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


      this.annotation = this.resolveAnnotationText(chartDatas[dataCount].endDate)
      this.data = chartDatas[dataCount].data.map(e => {
        return {
          label: e.symbol,
          value1: e.longShortRatio,
          value2: e.fundingRate,
          value3: typeof e.price === 'number' ? e.openInterest * e.price : e.openInterest
        }
      })

      dataCount += 1;
    }
    this.timer = setInterval(ticker, timerInterval)

    ticker()
  }

  private resolveAnnotationText(endDate: number): string {

    return `${format(endDate, 'yyyy-MM-dd HH:mm:ss')}`
  }

  private adjustQuery(): { [key: string]: any } {
    // MARK: 
    const formValue = this.form.value;
    const o: { [key: string]: any } = {};
    Object.keys(formValue).forEach((key) => {
      if (key === 'symbol' && formValue['symbol'] && formValue['symbol'].length > 0) {
        Object.assign(o, { symbol: { $in: formValue['symbol'] } })
      }
    });
    return o;
  }




}