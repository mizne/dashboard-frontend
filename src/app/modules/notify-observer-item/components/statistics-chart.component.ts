import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { da } from 'date-fns/locale';
import { Time } from 'lightweight-charts';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { startWith } from 'rxjs';
import { GeneralTableService } from 'src/app/shared';
import { fixTradingViewTime } from 'src/app/utils';

@Component({
  selector: 'statistics-chart',
  templateUrl: 'statistics-chart.component.html'
})

export class StatisticsChartComponent implements OnInit, OnChanges {
  constructor(
    private fb: FormBuilder,
    private generalTableService: GeneralTableService,
    private nzNotificationService: NzNotificationService,
  ) { }

  @Input() definitions: Array<{
    name: string;
    version: number;
    fields: string[];
  }> = [];

  versions = this.definitions.map(e => ({
    label: `${e.name} Version ${e.version}`,
    value: e.version
  }))

  versionCtrl = new FormControl(this.versions.length > 0 ? this.versions[this.versions.length - 1].value : null);

  viewDataResults: Array<any> = [];
  charts: Array<{
    label: string;
    series: Array<{
      type: string;
      color: string;
      data: { time: Time; value: number }[];
    }>
  }> = [];

  chartOptions = {
    localization: {
      priceFormatter: (n: number) => {
        if (n >= 1e9) {
          return `${(n / 1e9).toFixed(2)} B`
        }
        if (n >= 1e6) {
          return `${(n / 1e6).toFixed(2)} M`
        }
        if (n >= 1e3) {
          return `${(n / 1e3).toFixed(2)} K`
        }
        return `${(n).toFixed(2)}`
      },
    },
  }

  ngOnInit() {
    if (this.versions.length > 0) {
      this.versionCtrl.valueChanges.pipe(
        startWith(this.versionCtrl.value)
      ).subscribe(() => {
        this.fetchStatisticsDataByVersion()
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.versions = this.definitions.map(e => ({
      label: `${e.name} Version ${e.version}`,
      value: e.version
    }))

    this.versionCtrl = new FormControl(this.versions.length > 0 ? this.versions[this.versions.length - 1].value : null);
  }

  private fetchStatisticsDataByVersion() {
    const version = this.versionCtrl.value;
    if (typeof version === 'number') {
      const theDefinition = this.definitions.find(e => e.version === version)
      const name = theDefinition?.name;
      const fields = theDefinition?.fields || [];

      this.generalTableService.queryList({
        name, version
      }, { number: 1, size: 100 })
        .subscribe({
          next: (modelDataResults: Array<any>) => {
            this.viewDataResults = this.convertModelDataResults(modelDataResults, fields);
            this.buildCharts();
          },
          error: (err: Error) => {
            this.nzNotificationService.error(`获取统计数据失败`, `${err.message}`)
          }
        })
    }
  }

  private convertModelDataResults(modelDataResults: Array<any>, fields: string[]) {
    return modelDataResults.map(e => this.viewDataMapper(e, fields))
  }

  private viewDataMapper(modelData: any, fields: string[]): any {
    return Object.keys(modelData).filter(key => key.startsWith('field')).reduce<any>((accu, modelKey) => {
      const viewKey = this.resolveViewKey(modelKey, fields);
      accu[viewKey] = modelData[modelKey]
      return accu;
    }, {
      createdAt: modelData['createdAt'],
      createdAtStr: modelData['createdAtStr'],
    })
  }

  private resolveViewKey(modelKey: string, viewKeys: string[]): string {
    const modelKeys = Array.from({ length: 30 }, (_, i) => `field${i + 1}`);
    const modelKeyIndex = modelKeys.indexOf(modelKey);
    if (modelKeyIndex === -1) {
      throw new Error(`[StatisticsChartComponent] resolveViewKey() not found model key: ${modelKey}`)
    }

    return viewKeys[modelKeyIndex]
  }

  private buildCharts() {
    const version = this.versionCtrl.value;
    if (typeof version === 'number') {
      const theDefinition = this.definitions.find(e => e.version === version)
      const fields = theDefinition?.fields || [];

      this.charts = fields.map(viewKey => {
        const series: Array<{
          type: string;
          color: string;
          data: { time: Time; value: number }[];
        }> = [
            {
              type: 'line',
              color: '#f6bf26',
              data: this.viewDataResults
                .sort((a, b) => a.createdAt - b.createdAt)
                .map(e => ({ createdAt: e.createdAt, value: e[viewKey] }))
                .map(e => ({ time: fixTradingViewTime(e.createdAt), value: e.value }))
            }
          ]
        return {
          label: viewKey,
          series
        }
      })
    }
  }
}