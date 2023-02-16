import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
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
import { CexTokenService } from '../../services/cex-token.service';

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
  });

  status: 'loading' | 'error' | 'success' | '' = '';

  charts = [
    {
      tagLabel: 'tag label 1',
      series: [
        {
          type: 'line',
          color: '#2962FF',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#FF0000',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#00FF00',
          data: this.generateRandom()
        }
      ]
    },
    {
      tagLabel: 'tag label 2',
      series: [
        {
          type: 'line',
          color: '#2962FF',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#FF0000',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#00FF00',
          data: this.generateRandom()
        }
      ]
    },
    {
      tagLabel: 'tag label 3',
      series: [
        {
          type: 'line',
          color: '#2962FF',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#FF0000',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#00FF00',
          data: this.generateRandom()
        }
      ]
    },
    {
      tagLabel: 'tag label 4',
      series: [
        {
          type: 'line',
          color: '#2962FF',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#FF0000',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#00FF00',
          data: this.generateRandom()
        }
      ]
    },
    {
      tagLabel: 'tag label 5',
      series: [
        {
          type: 'line',
          color: '#2962FF',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#FF0000',
          data: this.generateRandom()
        },
        {
          type: 'line',
          color: '#00FF00',
          data: this.generateRandom()
        }
      ]
    }
  ]



  generateRandom(): Array<{ time: string; value: number }> {
    return [
      { time: '2019-04-11', value: Math.random() },
      { time: '2019-04-12', value: Math.random() },
      { time: '2019-04-13', value: Math.random() },
      { time: '2019-04-14', value: Math.random() },
      { time: '2019-04-15', value: Math.random() },
      { time: '2019-04-16', value: Math.random() },
      { time: '2019-04-17', value: Math.random() },
      { time: '2019-04-18', value: Math.random() },
      { time: '2019-04-19', value: Math.random() },
      { time: '2019-04-20', value: Math.random() },
    ]
  }

  submitForm(): void {
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      interval: this.intervals[0].name,
    });
    this.loadDataFromServer();
  }

  ngOnInit(): void {

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
        console.log(this.chartItems)
      },
      (e: Error) => {
        this.loading = false;
        this.status = 'error';
        this.notification.error(`获取失败`, `${e.message}`);
      }
    );
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
