import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  WomPegService,
} from '../../services';
import { FormControl } from '@angular/forms';
import { WomPeg } from '../../models';
import { Time } from 'lightweight-charts';
import { fixTradingViewTime } from 'src/app/utils';
import { TradingViewChartTypes } from '../tradingview-chart/tradingview-chart.component';

@Component({
  selector: 'wom-peg-chart',
  templateUrl: 'wom-peg-chart.component.html',
})
export class WomPegChartComponent implements OnInit {
  constructor(
    private womPegService: WomPegService,
    private notification: NzNotificationService,
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
    type: TradingViewChartTypes;
    color: string;
    data: { time: Time; value: number }[];
  }> = []
  daysCtrl = new FormControl(180)

  ngOnInit() { }

  open(): void {
    this.visible = true;
    this.fetchWomPegs()
  }

  close(): void {
    this.visible = false;
  }

  toSearch() {
    this.fetchWomPegs()
  }

  private fetchWomPegs() {
    this.fetching = true;
    this.womPegService.queryList({}, { number: 1, size: (this.daysCtrl.value || 180) * 12 })
      .subscribe(
        {
          next: (v) => {
            this.fetching = false;
            this.womPegs = v.sort((a, b) => a.createdAt - b.createdAt).filter(e => (e.mWom > 0) && (e.wmxWom > 0) && (e.qWom > 0));
            this.series = [
              {
                type: TradingViewChartTypes.LINE,
                color: this.chartTypes[0].color,
                data: this.womPegs.map(e => ({ time: fixTradingViewTime(e.createdAt), value: e.mWom }))
              },
              {
                type: TradingViewChartTypes.LINE,
                color: this.chartTypes[1].color,
                data: this.womPegs.map(e => ({ time: fixTradingViewTime(e.createdAt), value: e.wmxWom }))
              },
              {
                type: TradingViewChartTypes.LINE,
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
