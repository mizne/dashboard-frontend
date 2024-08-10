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
import { isEmpty, stringifyNumber } from 'src/app/utils';
import { ScaleType } from '@antv/g2/lib/interface';

const defaultColors = ['#063d8a', '#1770d6', '#47abfc', '#38c060'];

// https://g2-v4.antv.vision/en/examples/case/dynamic#dynamic-bubble
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
  @Input() min: {
    value1?: number;
    value2?: number;
    value3?: number;
  } = {}
  @Input() max: {
    value1?: number;
    value2?: number;
    value3?: number;
  } = {}

  @Input() tickInterval: {
    value1?: number;
    value2?: number;
    value3?: number;
  } = {}

  @Input() styleKey: string | null = null
  @Input() styleCallback: Function | null = null
  @Input() annotation: string | null = null
  @Input() animateDuration = 1e3

  @Input() height = 240;
  @Input() width = 420;


  private _chart: Chart | null = null;
  private _geo: Geometry | null = null;
  private rendered = false

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

    if (!this.rendered) {
      const chart = this._chart;
      const data = this.data

      const alias = this.alias
      const formatter = this.formatter
      const min = this.min
      const max = this.max
      const tickInterval = this.tickInterval

      chart.data(data);
      // 为各个字段设置别名
      const labelScaleOption = {
        alias: alias.label,
        key: true,
        ...(!isEmpty(formatter.label) ? { formatter: formatter.label } : {}),
      }
      const value1ScaleOption = {
        alias: alias.value1,
        ...(formatter.value1 ? { formatter: formatter.value1 } : {}),
        ...(!isEmpty(min.value1) ? { min: min.value1 } : {}),
        ...(!isEmpty(max.value1) ? { max: max.value1 } : {}),
        ...(!isEmpty(tickInterval.value1) ? { tickInterval: tickInterval.value1 } : {})
      }
      const value2ScaleOption = {
        alias: alias.value2,
        ...(!isEmpty(formatter.value2) ? { formatter: formatter.value2 } : {}),
        ...(!isEmpty(min.value2) ? { min: min.value2 } : {}),
        ...(!isEmpty(max.value2) ? { max: max.value2 } : {}),
        ...(!isEmpty(tickInterval.value2) ? { tickInterval: tickInterval.value2 } : {})
      }
      const value3ScaleOption = {
        type: 'pow' as ScaleType,
        alias: alias.value3,
        ...(!isEmpty(formatter.value3) ? { formatter: formatter.value3 } : {}),
        ...(!isEmpty(min.value3) ? { min: min.value3 } : {}),
        ...(!isEmpty(max.value3) ? { max: max.value3 } : {}),
        ...(!isEmpty(tickInterval.value3) ? { tickInterval: tickInterval.value3 } : {})
      }
      console.log(`[BubbleChartComponent] chartID: ${this.chartID}, \nlabelScaleOption: `, labelScaleOption, ' \nvalue1ScaleOption: ', value1ScaleOption, ' \nvalue2ScaleOption: ', value2ScaleOption, ' \nvalue3ScaleOption: ', value3ScaleOption)
      chart.scale({
        label: labelScaleOption,
        value1: value1ScaleOption,
        value2: value2ScaleOption,
        value3: value3ScaleOption,
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
      this._geo = chart.point().position('value1*value2')
        .size('value3', [4, 65])
        .shape('circle')
        .tooltip('label*value3*value1*value2')
        .animate({
          update: {
            duration: this.animateDuration,
            easing: 'easeLinear'
          }
        })

      if (this.styleKey && this.styleCallback) {
        this._geo = this._geo.style(this.styleKey, this.styleCallback as any);
      }

      if (this.annotation) {
        chart.annotation().text({
          position: ['50%', '50%'],
          content: this.annotation,
          style: {
            fontSize: 100,
            fill: '#999',
            textAlign: 'center',
            fillOpacity: 0.3
          },
          top: false,
          animate: false,
        });
      }

      chart.interaction('element-active');
      chart.render();
      this.rendered = true
    } else {
      const chart = this._chart;
      chart.annotation().clear(true);
      if (this.annotation) {
        chart.annotation().text({
          position: ['50%', '50%'],
          content: this.annotation,
          style: {
            fontSize: 100,
            fill: '#999',
            textAlign: 'center',
            fillOpacity: 0.3
          },
          top: false,
          animate: false,

        });
      }

      chart.changeData(this.data)

      this.checkDataMinMaxLimit()
    }
  }

  private checkDataMinMaxLimit() {
    this.checkValue1MinMaxLimit()
    this.checkValue2MinMaxLimit()
    this.checkValue3MinMaxLimit()
  }

  private checkValue1MinMaxLimit() {
    if (this.min && typeof this.min.value1 === 'number' && !isEmpty(this.min.value1)) {
      const the = this.data.filter(e => e.value1 < (this.min.value1 as number))
      if (the.length > 0) {
        console.log(`[BubbleChartComponent] chartID: ${this.chartID} find less than min value1, min value1: ${this.min.value1}, the: ${JSON.stringify(the, null, 2)}`)
      }
    }

    if (this.max && typeof this.max.value1 === 'number' && !isEmpty(this.max.value1)) {
      const the = this.data.filter(e => e.value1 > (this.max.value1 as number))
      if (the.length > 0) {
        console.log(`[BubbleChartComponent] chartID: ${this.chartID} find more than max value1, max value1: ${this.max.value1}, the: ${JSON.stringify(the, null, 2)}`)
      }
    }
  }

  private checkValue2MinMaxLimit() {
    if (this.min && typeof this.min.value2 === 'number' && !isEmpty(this.min.value2)) {
      const the = this.data.filter(e => e.value2 < (this.min.value2 as number))
      if (the.length > 0) {
        console.log(`[BubbleChartComponent] chartID: ${this.chartID} find less than min value2, min value2: ${this.min.value2}, the: ${JSON.stringify(the, null, 2)}`)
      }
    }

    if (this.max && typeof this.max.value2 === 'number' && !isEmpty(this.max.value2)) {
      const the = this.data.filter(e => e.value2 > (this.max.value2 as number))
      if (the.length > 0) {
        console.log(`[BubbleChartComponent] chartID: ${this.chartID} find more than max value2, max value2: ${this.max.value2}, the: ${JSON.stringify(the, null, 2)}`)
      }
    }
  }

  private checkValue3MinMaxLimit() {
    if (this.min && typeof this.min.value3 === 'number' && !isEmpty(this.min.value3)) {
      const the = this.data.filter(e => e.value3 < (this.min.value3 as number))
      if (the.length > 0) {
        console.log(`[BubbleChartComponent] chartID: ${this.chartID} find less than min value3, min value3: ${this.min.value3}, the: ${JSON.stringify(the, null, 2)}`)
      }
    }

    if (this.max && typeof this.max.value3 === 'number' && !isEmpty(this.max.value3)) {
      const the = this.data.filter(e => e.value3 > (this.max.value3 as number))
      if (the.length > 0) {
        console.log(`[BubbleChartComponent] chartID: ${this.chartID} find more than max value3, max value3: ${this.max.value3}, the: ${JSON.stringify(the, null, 2)}`)
      }
    }
  }


  private destroyChart() {
    if (!this._chart) {
      return;
    }

    this._chart.destroy();
    this._chart = null;
  }
}
