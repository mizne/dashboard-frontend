import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import * as uuid from 'uuid';
import { Chart, Util } from '@antv/g2';
import { colors } from 'src/app/utils';

// const defaultColors = ['#063d8a', '#1770d6', '#47abfc', '#38c060'];
const defaultColors = colors;

@Component({
  selector: 'pie-chart',
  templateUrl: 'pie-chart.component.html',
})
export class PieChartComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  chartID = 'pie-chart-wrapper-' + uuid.v4();
  constructor() { }

  @Input() data: Array<{ label: string; value: number; color?: string }> = [];
  @Input() height = 240;
  @Input() width = 420;

  private _chart: Chart | null = null;

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.initChart();
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.renderChart();
  }

  private initChart() {
    if (this._chart) {
      return;
    }
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
    const data = this.adjustData(this.data);

    chart.data(data.map((e) => ({ label: e.label, value: e.value })));

    chart.coordinate('theta', {
      radius: 0.75,
    });
    chart.tooltip({
      showMarkers: false,
    });

    const interval = chart
      .interval()
      .adjust('stack')
      .position('value')
      .color(
        'label',
        data.map((e) => e.color)
      )
      .style({ opacity: 0.4 })
      .state({
        active: {
          style: (element) => {
            const shape = element.shape;
            return {
              matrix: Util.zoom(shape, 1.1),
            };
          },
        },
      })
      .label('label', (val) => {
        return {
          offset: -30,
          style: {
            opacity: 1,
            fill: 'white',
            fontSize: 12,
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
          },
          content: (obj: any) => {
            return obj.label + ' ' + obj.value;
          },
        };
      });

    chart.interaction('element-single-selected');

    chart.render();
  }

  private adjustData(
    data: Array<{ label: string; value: number; color?: string }>
  ): Array<{ label: string; value: number; color: string }> {
    const results: Array<{ label: string; value: number; color: string }> = [];
    for (const [i, e] of data.entries()) {
      results.push({
        label: e.label,
        value: e.value,
        color: e.color || defaultColors[i % defaultColors.length],
      });
    }

    return results;
  }

  private destroyChart() {
    if (!this._chart) {
      return;
    }

    this._chart.destroy();
    this._chart = null;
  }
}
