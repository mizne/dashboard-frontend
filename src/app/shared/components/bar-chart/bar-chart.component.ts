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
import { colors } from 'src/app/utils';

// const defaultColors = ['#063d8a', '#1770d6', '#47abfc', '#38c060'];
const defaultColors = colors;

interface BarChartBaseline {
  value: number; // 显示的高度
  text?: string;
}

@Component({
  selector: 'bar-chart',
  templateUrl: 'bar-chart.component.html',
})
export class BarChartComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  chartID = 'bar-chart-wrapper-' + uuid.v4();
  constructor() { }

  @Input() data: Array<{ label: string; value: number; color?: string; text?: string; textOffsetY?: number; textColor?: string; }> = [];
  @Input() height = 240;
  @Input() width = 420;

  @Input() baseline: null | BarChartBaseline | BarChartBaseline[] = null

  @Output() barClick = new EventEmitter<any>()

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

    this._chart.on('element:click', (ev: any) => {
      const { data } = ev;
      console.log('Clicked Bar:', ev);
      // 这里可以执行你想要的操作，例如弹出详细信息框等
      this.barClick.emit(ev)
    });
  }

  private renderChart() {
    if (!this._chart) {
      return;
    }
    const chart = this._chart;
    const data = this.adjustData(this.data);

    chart.clear();
    chart.data(data.map((e) => ({ label: e.label, value: e.value })));

    chart.scale('value', {
      alias: '数量',
    });

    chart.axis('label', {
      tickLine: {
        alignTick: false,
      },
    });
    chart.axis('value', false);

    chart.tooltip({
      showMarkers: false,
    });
    chart.interval().position('label*value')
      .color(
        'label',
        data.map((e) => e.color)
      )
      .style({ opacity: 0.4 });
    chart.interaction('element-active');

    // 添加文本标注
    data.forEach((item) => {
      // 默认添加 value 数字标注
      chart
        .annotation()
        .text({
          position: [item.label, item.value],
          content: item.value,
          style: {
            textAlign: 'center',
          },
          offsetY: -30,
        })

      if (item.text) {
        chart
          .annotation()
          .text({
            position: [item.label, item.value],
            content: item.text,
            style: {
              textAlign: 'center',
              fill: item.textColor || '#673ab7'
            },
            offsetY: item.textOffsetY || 0,
            offsetX: 0
          })
      }
    });

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

  private renderBaseline(chart: Chart, line: BarChartBaseline) {
    chart.annotation().line({
      top: true, // 将基准线放在图表的最上层
      start: ['min', line.value], // 起点坐标，'min' 表示 x 轴的最小值，55 是 y 轴上的基准线值
      end: ['max', line.value], // 终点坐标，'max' 表示 x 轴的最大值，55 是 y 轴上的基准线值
      style: {
        stroke: '#FF0000', // 基准线颜色
        lineWidth: 2, // 基准线宽度
        lineDash: [4, 4], // 虚线样式
      },
      ...(line.text ? {
        text: {
          position: 'center', // 文本位置，可选值 'start', 'center', 'end'
          content: line.text, // 文本内容
          style: {
            fill: '#FF0000', // 文本颜色
            fontSize: 12,
            fontWeight: 'bold',
          },
          offsetX: 10, // 文本水平偏移
          offsetY: -5, // 文本垂直偏移
        },
      } : {})
    });
  }

  private adjustData(
    data: Array<{ label: string; value: number; color?: string; text?: string; textOffsetY?: number; textColor?: string; }>
  ): Array<{ label: string; value: number; color: string; text?: string; textOffsetY?: number; textColor?: string; }> {
    const results: Array<{ label: string; value: number; color: string; text?: string; textOffsetY?: number; textColor?: string; }> = [];
    for (const [i, e] of data.entries()) {
      results.push({
        label: e.label,
        value: e.value,
        color: e.color || defaultColors[i % defaultColors.length],
        text: e.text,
        textOffsetY: e.textOffsetY,
        textColor: e.textColor
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
