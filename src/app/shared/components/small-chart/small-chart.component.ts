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
import { KlineIntervals } from '../../models';
import { format } from 'date-fns';
import { filter, interval, Subscription, take } from 'rxjs';
import { stringifyNumber } from 'src/app/utils';

@Component({
  selector: 'small-chart',
  templateUrl: './small-chart.component.html',
})
export class SmallChartComponent implements OnInit, AfterViewInit, OnDestroy {
  smallChartID = 'small-chart-wrapper-' + uuid.v4();
  largeChartID = 'large-chart-wrapper-' + uuid.v4();

  @Input() data: number[] = [];
  @Input() interval: string | null = KlineIntervals.FOUR_HOURS;
  @Input() time: number = 0;
  @Input() title: string = '标题';

  @Input() type: 'line' | 'bar' | 'area' = 'line';
  @Input() height = 40;
  @Input() width = 120;
  @Input() priceMode = false;
  @Input() showAxis = false;
  @Input() regionFilters: any = null;

  @Input() largeHeight = 400;
  @Input() largeWidth = 900;

  private _smallChart: Chart | null = null;
  private _largeChart: Chart | null = null;

  isVisible = false;
  subscription: Subscription | null = null;

  constructor() {}
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(`[SmallChartComponent] ngOnChanges() changes: `, changes);
    this.renderChart(this._smallChart);
    this.renderChart(this._largeChart);
  }

  ngAfterViewInit(): void {
    this.initSmallChart();
    this.renderChart(this._smallChart);
  }

  ngOnDestroy(): void {
    if (this._smallChart) {
      this._smallChart.destroy();
      this._smallChart = null;
    }
    if (this._largeChart) {
      this._largeChart.destroy();
      this._largeChart = null;
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  toShowLargeChart() {
    this.isVisible = true;

    this.subscription = interval(1e2)
      .pipe(
        filter(() => !!document.getElementById(this.largeChartID)),
        take(1)
      )
      .subscribe(() => {
        this.initLargeChart();
        this.renderChart(this._largeChart);
      });
  }
  handleCancel() {
    this.isVisible = false;
    if (this._largeChart) {
      this._largeChart.destroy();
      this._largeChart = null;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private initSmallChart() {
    if (this._smallChart) {
      return;
    }
    this._smallChart = new Chart({
      container: this.smallChartID,
      autoFit: false,
      height: this.height,
      width: this.width,
    });
  }

  private initLargeChart() {
    if (this._largeChart) {
      return;
    }
    this._largeChart = new Chart({
      container: this.largeChartID,
      autoFit: false,
      height: this.largeHeight,
      width: this.largeWidth,
    });
  }

  private renderChart(chart: Chart | null) {
    if (chart) {
      chart.clear();
      // const chart = this._smallChart;
      const hasTimeAndInterval = !!(this.time && this.interval);
      const adjustedData = hasTimeAndInterval
        ? this.data.map((e, i) => {
            return {
              value: e,
              time: format(
                this.time -
                  (this.data.length - i) *
                    this.resolveDuration(this.interval as KlineIntervals),
                'MM-dd HH:mm'
              ),
            };
          })
        : this.data.map((e, i) => ({ value: e, index: i }));
      chart.data(adjustedData);

      let geometry = null;
      if (this.type === 'line') {
        geometry = chart
          .line()
          .position(hasTimeAndInterval ? 'time*value' : 'index*value');
      } else if (this.type === 'bar') {
        geometry = chart
          .interval()
          .position(hasTimeAndInterval ? 'time*value' : 'index*value');
      } else if (this.type === 'area') {
        geometry = chart
          .line()
          .position(hasTimeAndInterval ? 'time*value' : 'index*value');
        chart
          .area()
          .position(hasTimeAndInterval ? 'time*value' : 'index*value');
      } else {
        console.warn(
          `[small-chart.component] unknown chart type: ${this.type}`
        );
        geometry = chart
          .line()
          .position(hasTimeAndInterval ? 'time*value' : 'index*value');
      }

      if (hasTimeAndInterval && chart === this._largeChart) {
        geometry.tooltip('time*value', (time, value) => {
          return {
            time: time,
            value: stringifyNumber(value as number),
          };
        });
      }

      if (hasTimeAndInterval) {
        if (chart === this._largeChart) {
          chart.axis('time', true);
          chart.axis('value', {
            label: {
              formatter: (text: string, item, index: number) => {
                return Number(text).toLocaleString();
              },
            },
          });
          chart.tooltip(true);
        } else {
          chart.axis('time', false);
          chart.axis('value', this.showAxis);
          chart.tooltip(false);
        }
      } else {
        chart.axis('index', false);
        chart.axis('value', this.showAxis);
        chart.tooltip(false);
      }

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

  private resolveDuration(interval: KlineIntervals): number {
    switch (interval) {
      case KlineIntervals.FOUR_HOURS:
        return 4 * 60 * 60 * 1e3;
      case KlineIntervals.ONE_DAY:
        return 24 * 60 * 60 * 1e3;
      default:
        console.error(
          `[SmallChartComponent] resolveDuration() unknown interval: ${interval}`
        );
        return 4 * 60 * 60 * 1e3;
    }
  }
}
