import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as uuid from 'uuid';
import { Chart } from '@antv/g2';

export interface Legend {
  type: {
    lt?: number;
    lte?: number;
    gt?: number;
    gte?: number;
  };
  color: string;
}

export function normalizeLegendType(legend: Legend): string {
  const keys = Object.keys(legend.type);
  if (keys.length === 1 || keys.length === 2) {
    if (keys.length === 1) {
      return normalizeLegendTypeOfSingleKey(legend)
    }
    return normalizeLegendTypeOfDoubleKeys(legend)
  } else {
    throw new Error(`normalizeLegendType() legend keys not right, keys: ${JSON.stringify(keys)}`)
  }
}

export function filterLegendType(legend: Legend): (n: number) => boolean {
  const keys = Object.keys(legend.type);
  if (keys.length === 1 || keys.length === 2) {
    if (keys.length === 1) {
      return filterLegendTypeOfSingleKey(keys[0], (legend.type as any)[keys[0]])
    }
    return filterLegendTypeOfDoubleKeys(legend)
  } else {
    throw new Error(`filterLegendType() legend keys not right, keys: ${JSON.stringify(keys)}`)
  }
}

function normalizeLegendTypeOfSingleKey(legend: Legend): string {
  const keys = Object.keys(legend.type);
  if (keys[0] === 'lt') {
    return `<${percentNumber(legend.type['lt'] as number)}`
  }
  if (keys[0] === 'lte') {
    return `<=${percentNumber(legend.type['lte'] as number)}`
  }
  if (keys[0] === 'gt') {
    return `>${percentNumber(legend.type['gt'] as number)}`
  }
  if (keys[0] === 'gte') {
    return `>=${percentNumber(legend.type['gte'] as number)}`
  }
  throw new Error(`normalizeLegendTypeOfSingleKey() unknown key: ${keys[0]}`)
}

function filterLegendTypeOfSingleKey(key: string, value: number): (n: number) => boolean {
  if (key === 'lt') {
    return (n: number) => n < value
  }
  if (key === 'lte') {
    return (n: number) => n <= value
  }
  if (key === 'gt') {
    return (n: number) => n > value
  }
  if (key === 'gte') {
    return (n: number) => n >= value
  }
  throw new Error(`filterLegendTypeOfSingleKey() unknown key: ${key}`)
}

function normalizeLegendTypeOfDoubleKeys(legend: Legend): string {
  const keys = Object.keys(legend.type).sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
  if (keys[0].charAt(0) === 'g' && keys[1].charAt(0) === 'l') {
    return `${resolveBracket(keys[0])}${percentNumber((legend.type as any)[keys[0]] as number)},${percentNumber((legend.type as any)[keys[1]] as number)}${resolveBracket(keys[1])}`
  } else {
    throw new Error(`normalizeLegendTypeOfDoubleKeys() error keys: ${JSON.stringify(keys)}`)
  }
}

function filterLegendTypeOfDoubleKeys(legend: Legend): (n: number) => boolean {
  const keys = Object.keys(legend.type).sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
  if (keys[0].charAt(0) === 'g' && keys[1].charAt(0) === 'l') {
    return (n: number) => {
      const pre1 = filterLegendTypeOfSingleKey(keys[0], (legend.type as any)[keys[0]]);
      const pre2 = filterLegendTypeOfSingleKey(keys[1], (legend.type as any)[keys[1]]);
      return pre1(n) && pre2(n)
    }
  } else {
    throw new Error(`filterLegendTypeOfDoubleKeys() error keys: ${JSON.stringify(keys)}`)
  }
}

function resolveBracket(typeKey: string): string {
  if (typeKey === 'gt') {
    return '('
  }
  if (typeKey === 'gte') {
    return '['
  }
  if (typeKey === 'lt') {
    return ')'
  }
  if (typeKey === 'lte') {
    return ']'
  }
  throw new Error(`resolveBracket() error typeKey: ${typeKey}`)
}

function percentNumber(n: number): string {
  if (n < 0.1) {
    return `${n * 100}%`
  }
  return String(n)
}

@Component({
  selector: 'stack-bar-chart',
  templateUrl: './stack-bar-chart.component.html'
})

export class StackBarChartComponent implements OnInit, AfterViewInit, OnChanges {
  constructor() { }

  chart: Chart | null = null;

  chartID = 'stack-bar-chart-wrapper-' + uuid.v4();

  height = 240;

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

    chart.axis('value', {
      position: 'bottom',
      title: {
        offset: 40,
        style: {
          fill: '#999999'
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