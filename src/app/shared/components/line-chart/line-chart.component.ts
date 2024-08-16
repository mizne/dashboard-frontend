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
import { Chart, Geometry, Util } from '@antv/g2';
import { colors, isNil } from 'src/app/utils';

// const defaultColors = ['#063d8a', '#1770d6', '#47abfc', '#38c060'];
const defaultColors = colors;

interface LineChartBaseline {
  value: number; // 显示的高度
  text?: string;
}

@Component({
  selector: 'line-chart',
  templateUrl: 'line-chart.component.html',
})
export class LineChartComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  chartID = 'line-chart-wrapper-' + uuid.v4();
  constructor() { }

  @Input() data: Array<{ label: string; value: number; group?: string; }> = [];
  @Input() min: null | undefined | number
  @Input() max: null | undefined | number
  @Input() height = 240;
  @Input() width = 420;

  @Input() baseline: null | LineChartBaseline | LineChartBaseline[] = null

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
    const data = this.data;

    chart.clear();
    chart.data(data);

    chart.scale({
      label: {
        range: [0, 1],
      },
      value: {
        ...(typeof this.min === 'number' ? { min: this.min } : {}),
        ...(typeof this.max === 'number' ? { max: this.max } : {}),
      },
    });

    chart.tooltip({
      showCrosshairs: true, // 展示 Tooltip 辅助线
      shared: false,
    });

    if (data.length > 0 && !isNil(data[0].group)) {
      chart.line().position('label*value').color('group').shape('smooth')
    } else {
      chart.line().position('label*value').shape('smooth');
    }

    // chart.point().position('label*value');

    if (this.baseline) {
      // 添加基准线标注
      if (Array.isArray(this.baseline)) {
        this.baseline.forEach(line => {
          this.renderBaseline(chart, line)
        })
      } else {
        this.renderBaseline(chart, this.baseline)
      }
    }


    chart.render();
  }

  private renderBaseline(chart: Chart, line: LineChartBaseline) {
    chart.annotation().line({
      start: ['min', line.value],
      end: ['max', line.value],
      style: {
        stroke: '#ff4d4f',
        lineWidth: 2,
        lineDash: [4, 4],
      },
      ...(line.text ? {
        text: {
          position: 'start',
          style: {
            fill: '#8c8c8c',
            fontSize: 15,
            fontWeight: 'normal',
          },
          content: line.text,
          offsetY: -5,
        },
      } : {})
    });
  }


  private destroyChart() {
    if (!this._chart) {
      return;
    }

    this._chart.destroy();
    this._chart = null;
  }
}
