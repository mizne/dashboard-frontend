import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as uuid from 'uuid';
import { Chart } from '@antv/g2';

@Component({
  selector: 'small-chart',
  templateUrl: './small-chart.component.html',
})
export class SmallChartComponent implements OnInit, AfterViewInit {
  smallChartID = 'small-chart-container-' + uuid.v4();

  @Input() data: number[] = [];
  @Input() type: 'line' | 'bar' = 'line';
  @Input() height = 40;
  @Input() width = 120;

  constructor() {}
  ngOnInit() {}

  ngAfterViewInit(): void {
    const chart = new Chart({
      container: this.smallChartID,
      autoFit: false,
      height: this.height,
      width: this.width,
    });
    chart.data(this.data.map((e, i) => ({ value: e, index: i })));

    if (this.type === 'line') {
      chart.line().position('index*value');
    } else if (this.type === 'bar') {
      chart.interval().position('index*value');
    } else {
      console.warn(`[small-chart.component] unknown chart type: ${this.type}`);
      chart.line().position('index*value');
    }
    chart.axis('index', false);
    chart.axis('value', false);
    chart.tooltip(false);

    chart.scale('value', {
      type: 'linear',
    });

    chart.render();
  }
}
