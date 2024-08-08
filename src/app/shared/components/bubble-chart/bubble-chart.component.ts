import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import * as uuid from 'uuid';
import { Chart, Util } from '@antv/g2';
import { stringifyNumber } from 'src/app/utils';

const defaultColors = ['#063d8a', '#1770d6', '#47abfc', '#38c060'];

@Component({
  selector: 'bubble-chart',
  templateUrl: 'bubble-chart.component.html',
})
export class BubbleChartComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  chartID = 'bubble-chart-wrapper-' + uuid.v4();
  constructor() { }

  @Input() data: Array<{
    label: string;
    value1: number;
    value2: number;
    value3: number;
  }> = [];

  @Input() alias: {
    label?: string;
    value1?: string;
    value2?: string;
    value3?: string;
  } = {}
  @Input() formatter: {
    label?: (value: any) => any;
    value1?: (value: any) => any;
    value2?: (value: any) => any;
    value3?: (value: any) => any;
  } = {}

  @Input() styleKey: string | null = null
  @Input() styleCallback: Function | null = null

  @Input() height = 240;
  @Input() width = 420;


  private _chart: Chart | null = null;

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.initChart();
    this.renderChart();
  }

  ngOnDestroy(): void {
    // console.log('ngOnDestroy() ' + this.chartID)
    this.destroyChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.renderChart();
  }

  private initChart() {
    if (this._chart) {
      return;
    }
    // console.log('initChart() ' + this.chartID)
    this._chart = new Chart({
      container: this.chartID,
      autoFit: true,
      width: this.width,
      height: this.height,
    });
  }

  private renderChart() {
    if (!this._chart) {
      return;
    }
    const chart = this._chart;
    const data = this.data

    const alias = this.alias
    const formatter = this.formatter
    let geo = null

    chart.data(data);
    // 为各个字段设置别名
    chart.scale({
      label: {
        alias: alias.label,
        ...(formatter.label ? { formatter: formatter.label } : {})
      },
      value1: {
        alias: alias.value1,
        nice: true,
        ...(formatter.value1 ? { formatter: formatter.value1 } : {})
      },
      value2: {
        alias: alias.value2,
        nice: true,
        ...(formatter.value2 ? { formatter: formatter.value2 } : {})
      },
      value3: {
        type: 'pow',
        alias: alias.value3,
        ...(formatter.value3 ? { formatter: formatter.value3 } : {})
      },
    });
    chart.axis('value1', {
      label: {
        formatter(value) {
          return value
        } // 格式化坐标轴的显示
      }
    });
    chart.tooltip({
      showTitle: false,
      showMarkers: false,
    });
    chart.legend('value3', false);
    geo = chart.point().position('value1*value2')
      .size('value3', [4, 65])
      .shape('circle')
      .tooltip('label*value3*value1*value2')

    if (this.styleKey && this.styleCallback) {
      geo = geo.style(this.styleKey, this.styleCallback as any);
    }

    chart.interaction('element-active');
    chart.render();
  }


  private destroyChart() {
    if (!this._chart) {
      return;
    }

    this._chart.destroy();
    this._chart = null;
  }
}
