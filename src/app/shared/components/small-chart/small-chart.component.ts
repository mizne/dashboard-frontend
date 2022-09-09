import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import * as uuid from 'uuid';
import { Chart } from '@antv/g2';

@Component({
  selector: 'small-chart',
  templateUrl: './small-chart.component.html',
})
export class SmallChartComponent implements OnInit, AfterViewInit, OnDestroy {
  smallChartID = 'small-chart-container-' + uuid.v4();

  @Input() data: number[] = [];
  @Input() type: 'line' | 'bar' | 'area' = 'line';
  @Input() height = 40;
  @Input() width = 120;
  @Input() priceMode = false;
  @Input() showAxis = false;
  @Input() regionFilters: any = null;

  private _chart: Chart | null = null;

  constructor() {}
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.renderChart();
  }

  ngAfterViewInit(): void {
    this.initChart();
    this.renderChart();
  }

  ngOnDestroy(): void {
    if (this._chart) {
      this._chart.destroy();
    }
  }

  private initChart() {
    if (this._chart) {
      return;
    }
    this._chart = new Chart({
      container: this.smallChartID,
      autoFit: false,
      height: this.height,
      width: this.width,
    });
  }

  private renderChart() {
    if (this._chart) {
      const chart = this._chart;
      chart.data(this.data.map((e, i) => ({ value: e, index: i })));

      if (this.type === 'line') {
        chart.line().position('index*value');
      } else if (this.type === 'bar') {
        chart.interval().position('index*value');
      } else if (this.type === 'area') {
        chart.line().position('index*value');
        chart.area().position('index*value');
      } else {
        console.warn(
          `[small-chart.component] unknown chart type: ${this.type}`
        );
        chart.line().position('index*value');
      }
      chart.axis('index', false);
      chart.axis('value', this.showAxis);
      chart.tooltip(false);

      if (this.regionFilters && this.regionFilters.length > 0) {
        const filters = this.regionFilters as any[];
        filters.forEach((e) => {
          chart.annotation().regionFilter(e);
        });
      }

      chart.scale('value', {
        type: 'linear',
      });

      if (this.priceMode) {
        // 开启价格模式 修改内置主题的某些配置 最后价格比第一个价格大 则绿色主题 否则红色主题
        chart.theme({
          styleSheet: {
            brandColor:
              this.data[0] > this.data[this.data.length - 1]
                ? 'red'
                : this.data[0] < this.data[this.data.length - 1]
                ? 'green'
                : '#025DF4',
          },
        });
      }

      chart.render();
    }
  }
}
