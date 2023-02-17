import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { format } from 'date-fns';
import { Time, UTCTimestamp } from 'lightweight-charts';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { concatMap, forkJoin, map, Observable } from 'rxjs';
import { KlineIntervals, KlineIntervalService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { CexTokenAlert, CexTokenAlertTypes } from '../../models/cex-token-alert.model';
import { CexTokenTagAlert } from '../../models/cex-token-tag-alert.model';
import { CexTokenTag, tokenTagNameOfTotalMarket } from '../../models/cex-token-tag.model';
import { CexToken } from '../../models/cex-token.model';
import { CexTokenAlertService } from '../../services/cex-token-alert.service';
import { CexTokenTagAlertService } from '../../services/cex-token-tag-alert.service';
import { CexTokenTagService } from '../../services/cex-token-tag.service';

enum ChartTypes {
  ABOVE_EMA21_RATIO = 'ABOVE_EMA21_RATIO',
  ABOVE_EMA55_RATIO = 'ABOVE_EMA55_RATIO',
  ABOVE_EMA144_RATIO = 'ABOVE_EMA144_RATIO',
  LONG_RATIO = 'LONG_RATIO',
  SHOCK_RATIO = 'SHOCK_RATIO',
  SHORT_RATIO = 'SHORT_RATIO',
}

interface ChartOptions {
  isTotal: boolean;
  tagLabel: string;
  series: Array<{
    type: string;
    color: string;
    data: Array<{
      time: Time;
      value: number
    }>
  }>
}

@Component({
  selector: 'cex-token-tag-alert',
  templateUrl: 'cex-token-tag-alert.component.html',
})
export class CexTokenTagAlertComponent implements OnInit {
  constructor(
    private readonly cexTokenTagAlertService: CexTokenTagAlertService,
    private readonly cexTokenTagService: CexTokenTagService,
    private readonly notification: NzNotificationService,
    private readonly klineIntervalService: KlineIntervalService,
    private fb: FormBuilder
  ) { }

  visible = false;

  chartItems: Array<{
    tagName: string;
    tagLabel: string;
    tagAlerts: CexTokenTagAlert[];
  }> = [];
  loading = true;
  query: { [key: string]: any } = {};

  chartTypes = [
    {
      label: '大于EMA21占比',
      value: ChartTypes.ABOVE_EMA21_RATIO,
      color: '#f6bf26'
    },
    {
      label: '大于EMA144占比',
      value: ChartTypes.ABOVE_EMA144_RATIO,
      color: '#8e24aa'
    },
    {
      label: '多头占比',
      value: ChartTypes.LONG_RATIO,
      color: '#0b8043'
    },
    {
      label: '震荡占比',
      value: ChartTypes.SHOCK_RATIO,
      color: '#039be5'
    },
    {
      label: '空头占比',
      value: ChartTypes.SHORT_RATIO,
      color: '#d50000'
    },

  ]

  intervals = [
    {
      label: '4h',
      name: KlineIntervals.FOUR_HOURS,
    },
    {
      label: '1d',
      name: KlineIntervals.ONE_DAY,
    },
  ];

  form = this.fb.group({
    interval: [this.intervals[0].name],
    chartType: [[this.chartTypes[0].value]]
  });

  status: 'loading' | 'error' | 'success' | '' = '';

  charts: Array<ChartOptions> = []

  submitForm(): void {
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      interval: this.intervals[0].name,
      chartType: [this.chartTypes[0].value]
    });
    this.loadDataFromServer();
  }

  ngOnInit(): void {
  }

  getColor(type: ChartTypes) {
    return this.chartTypes.find(e => e.value === type)?.color || '#000000'
  }


  private loadDataFromServer(): void {
    this.loading = true;
    this.status = 'loading';
    this.query = {
      ...removeEmpty(this.form.value),
    };

    this.tagsObs().pipe(
      concatMap((tags: CexTokenTag[]) => {
        return forkJoin(tags.map(tag => this.tagChartItem(tag.name, tag.label)))
      })
    ).subscribe(
      (results) => {
        this.loading = false;
        this.status = 'success';
        this.chartItems = results;
        this.buildCharts();
      },
      (e: Error) => {
        this.loading = false;
        this.status = 'error';
        this.notification.error(`获取失败`, `${e.message}`);
      }
    );
  }

  private buildCharts() {
    const selectedChartTypes = (this.form.value.chartType || []) as Array<ChartTypes>

    const totalMarketChartItem = this.chartItems.find(e => e.tagName === tokenTagNameOfTotalMarket);
    const totalMarketChart = totalMarketChartItem ? [
      {
        isTotal: true,
        tagLabel: totalMarketChartItem.tagLabel,
        series: selectedChartTypes.map(e => {
          return {
            type: 'line',
            color: this.chartTypes.find(f => f.value === e)?.color || '#000000',
            data: this.resolveSeriesData(e, totalMarketChartItem.tagAlerts)
          }
        })
      }
    ] : []

    const otherCharts = this.chartItems.filter(e => e.tagName !== tokenTagNameOfTotalMarket)
      .map(charItem => {
        return {
          isTotal: false,
          tagLabel: charItem.tagLabel,
          series: selectedChartTypes.map(charType => {
            return {
              type: 'line',
              color: this.chartTypes.find(f => f.value === charType)?.color || '#000000',
              data: this.resolveSeriesData(charType, charItem.tagAlerts)
            }
          })
        }
      })

    this.charts = [
      ...totalMarketChart,
      ...otherCharts
    ]
    console.log(`this.charts: `, this.charts)
  }

  private resolveSeriesData(charType: ChartTypes, tagAlerts: CexTokenTagAlert[]): Array<{ time: Time; value: number }> {
    return tagAlerts.map(e => {

      switch (charType) {
        case ChartTypes.ABOVE_EMA21_RATIO:
          return { time: e.time / 1e3 as UTCTimestamp, value: this.fixedNumber(e.closeAboveEma21Ratio) }
        case ChartTypes.ABOVE_EMA55_RATIO:
          return { time: e.time / 1e3 as UTCTimestamp, value: this.fixedNumber(e.closeAboveEma55Ratio) }
        case ChartTypes.ABOVE_EMA144_RATIO:
          return { time: e.time / 1e3 as UTCTimestamp, value: this.fixedNumber(e.closeAboveEma144Ratio) }
        case ChartTypes.LONG_RATIO:
          return { time: e.time / 1e3 as UTCTimestamp, value: this.fixedNumber(e.longRatio) }
        case ChartTypes.SHOCK_RATIO:
          return { time: e.time / 1e3 as UTCTimestamp, value: this.fixedNumber(e.shockRatio) }
        case ChartTypes.SHORT_RATIO:
          return { time: e.time / 1e3 as UTCTimestamp, value: this.fixedNumber(e.shortRatio) }

        default:
          console.warn(`resolveSeriesData() unknown chart type: ${charType}`)
          return { time: e.time / 1e3 as UTCTimestamp, value: e.closeAboveEma21Ratio }
      }
    })
  }

  private fixedNumber(n: number): number {
    return Number(n.toFixed(3))
  }

  private tagsObs(): Observable<CexTokenTag[]> {
    return this.cexTokenTagService.queryList({})
  }

  private tagChartItem(tagName: string, tagLabel: string): Observable<{ tagName: string; tagLabel: string; tagAlerts: CexTokenTagAlert[] }> {
    return this.cexTokenTagAlertService.queryList(
      {
        name: tagName,
        ...this.adjustQuery(this.query)
      }
    )
      .pipe(
        map(e => ({ tagName, tagLabel, tagAlerts: e }))
      )
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // name 支持正则查询
    const o: { [key: string]: any } = {
      ...this.resolveTimeCondition(query['interval'])
    };
    Object.keys(query).forEach((key) => {
      Object.assign(o, { [key]: query[key] });
    });
    return o;
  }

  private resolveTimeCondition(
    interval: KlineIntervals
  ): { [key: string]: any } {
    switch (interval) {
      case KlineIntervals.FOUR_HOURS:
        return {
          time: {
            $gte: this.klineIntervalService.resolveFourHoursIntervalMills(
              60
            ),
          },
        };
      case KlineIntervals.ONE_DAY:
        return {
          time: {
            $gte: this.klineIntervalService.resolveOneDayIntervalMills(
              60
            ),
          },
        };
      default:
        console.warn(`resolveTimeCondition() unknown interval: ${interval}`);
        return {
          time: {
            $gte: this.klineIntervalService.resolveFourHoursIntervalMills(
              60
            ),
          },
        };
    }
  }

  open(): void {
    this.visible = true;
    this.loadDataFromServer();
  }

  close(): void {
    this.visible = false;
  }
}
