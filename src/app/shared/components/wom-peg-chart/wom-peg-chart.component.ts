import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  GlobalSettingsService,
  KlineIntervalService,
  SharedService,
  TimerService,
  WomPegService,
} from '../../services';
import { merge, startWith, map } from 'rxjs';
import { KlineIntervals } from '../../models/base.model';
import { FormBuilder } from '@angular/forms';
import { WomPeg } from '../../models';
import { Time, UTCTimestamp } from 'lightweight-charts';
import { fixTradingViewTime } from 'src/app/utils';

@Component({
  selector: 'wom-peg-chart',
  templateUrl: 'wom-peg-chart.component.html',
})
export class WomPegChartComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private womPegService: WomPegService,
    private notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  visible = false;

  fetching = false;
  womPegs: WomPeg[] = []

  chartTypes = [
    {
      label: 'mWom',
      color: '#f6bf26'
    },
    {
      label: 'wmxWom',
      color: '#8e24aa'
    },
    {
      label: 'qWom',
      color: '#0b8043'
    },
  ]
  series: Array<{
    type: string;
    color: string;
    data: { time: Time; value: number }[];
  }> = []

  ngOnInit() { }

  open(): void {
    this.visible = true;
    this.fetchWomPegs()
  }

  close(): void {
    this.visible = false;
  }

  private fetchWomPegs() {
    this.fetching = true;
    this.womPegService.queryList({}, { number: 1, size: 180 * 12 })
      .subscribe(
        {
          next: (v) => {
            this.fetching = false;
            this.womPegs = v.sort((a, b) => a.createdAt - b.createdAt);
            this.series = [
              {
                type: 'line',
                color: this.chartTypes[0].color,
                data: this.womPegs.map(e => ({ time: fixTradingViewTime(e.createdAt), value: e.mWom }))
              },
              {
                type: 'line',
                color: this.chartTypes[1].color,
                data: this.womPegs.map(e => ({ time: fixTradingViewTime(e.createdAt), value: e.wmxWom }))
              },
              {
                type: 'line',
                color: this.chartTypes[2].color,
                data: this.womPegs.map(e => ({ time: fixTradingViewTime(e.createdAt), value: e.qWom }))
              }
            ]
          },
          error: (e: Error) => {
            this.notification.error(`获取WomPeg失败`, `${e.message}`);
            this.fetching = false;
          },
        }
      )
  }
}
