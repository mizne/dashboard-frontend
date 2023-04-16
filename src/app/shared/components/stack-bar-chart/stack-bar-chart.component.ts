import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as uuid from 'uuid';
import { Chart } from '@antv/g2';

@Component({
  selector: 'stack-bar-chart',
  templateUrl: './stack-bar-chart.component.html'
})

export class StackBarChartComponent implements OnInit, AfterViewInit, OnChanges {
  constructor() { }

  chart: Chart | null = null;

  chartID = 'stack-bar-chart-wrapper-' + uuid.v4();

  height = 200;

  @Input() data: Array<{
    time: string;
    type: string;
    value: number
  }> = []

  @Input() title = ''
  @Input() colors: string[] = []

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.renderChart();
  }

  ngAfterViewInit(): void {
    this.initChart();
    this.renderChart();
  }

  private initChart() {
    if (this.chart) {
      return
    }

    const chart = new Chart({
      container: this.chartID,
      theme: 'classic',
      autoFit: true,
    });

    this.chart = chart;
  }

  private renderChart() {
    if (!this.chart) {
      return
    }
    this.chart.clear();
    const chart = this.chart;
    const data = this.data;

    chart.data(data);
    chart.scale('value', {
      alias: this.title
    });
    chart.axis('time', {
      tickLine: null,
    });

    chart.axis('value', {
      label: {
        formatter: text => {
          return text.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
        }
      },
      title: {
        offset: 80,
        style: {
          fill: '#aaaaaa'
        },
      }
    });
    chart.legend({
      position: 'top',
    });

    chart.tooltip({
      shared: true,
      showMarkers: false,
    });
    chart.interaction('active-region');

    chart
      .interval()
      .adjust('stack')
      .position('time*value')
      .color('type', this.colors);

    chart.render();
  }
}