import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChange, CexTokenPriceChangeService, KlineIntervalService, MarketRequest, MarketShift } from 'src/app/shared';
import { format, parse } from 'date-fns';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'market-shift-explorer',
  templateUrl: 'market-shift-explorer.component.html'
})
export class MarketShiftExplorerComponent implements OnInit, OnDestroy {
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

  requests = [
    {
      label: '发现顶部',
      value: MarketRequest.FIND_TOP
    },
    {
      label: '发现底部',
      value: MarketRequest.FIND_BOTTOM
    }
  ]

  loading = false;

  marketShiftItems: MarketShift[] = []

  defaultInDays = 180;
  form = this.fb.group({
    inDays: [this.defaultInDays],
    timeDateRange: [[]],
    request: [MarketRequest.FIND_TOP],
    currentPriceRelativeThreshold: [0.8],
    percentThreshold: [0.8]
  });

  alertMessage = '发现市场底部/顶部信号'

  submitForm(): void {

    const valid = this.checkFormValid()
    if (valid) {
      this.loadData();
    }

  }

  resetForm() {
    this.form.reset({
      inDays: this.defaultInDays
    });

    // this.loadChartData();
  }



  ngOnInit(): void {
  }

  ngOnDestroy(): void {

  }

  private checkFormValid() {
    const timeDateRange = this.form.get('timeDateRange')?.value;

    if (!timeDateRange || timeDateRange.length === 0) {
      this.notification.warning(`没有选择时间段`, `没有选择时间段`)
      return false
    }

    const currentPriceRelativeThreshold = this.form.get('currentPriceRelativeThreshold')?.value;
    if (typeof currentPriceRelativeThreshold !== 'number') {
      this.notification.warning(`当前价位的阈值必须为数字`, `当前价位的阈值必须为数字`)
      return false
    }

    const percentThreshold = this.form.get('percentThreshold')?.value;
    if (typeof percentThreshold !== 'number') {
      this.notification.warning(`百分比必须为数字`, `百分比必须为数字`)
      return false
    }

    return true
  }

  private async loadData() {
    this.loading = true;
    const dates = this.form.get('timeDateRange')?.value as Date[];
    const inDays = this.form.get('inDays')?.value as number;
    const currentPriceRelativeThreshold = this.form.get('currentPriceRelativeThreshold')?.value as number;
    const percentThreshold = this.form.get('percentThreshold')?.value as number;
    const request = this.form.get('request')?.value as MarketRequest;

    const resp = await lastValueFrom(this.cexTokenPriceChangeService.queryMarketShift(
      parse(`${format(dates[0], 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime(),
      parse(`${format(dates[1], 'yyyy-MM-dd')} 08:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime(),
      inDays,
      currentPriceRelativeThreshold,
      percentThreshold,
      request
    ))

    if (resp.code === 0) {
      this.marketShiftItems = resp.result
    } else {
      this.notification.error(`请求失败`, `${resp.message}`)
    }

    this.loading = false;
  }

}