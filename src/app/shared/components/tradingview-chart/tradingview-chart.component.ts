import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import * as uuid from 'uuid';
import { DestroyService } from '../../services/destroy.service';
import { createChart, IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts';

export enum TradingViewChartTypes {
  LINE = 'line',
  HISTOGRAM = 'histogram'
}

// https://tradingview.github.io/lightweight-charts/docs
// https://github.com/tradingview/lightweight-charts
@Component({
  selector: 'tradingview-chart',
  templateUrl: './tradingview-chart.component.html',
  providers: [DestroyService],
})
export class TradingviewChartComponent implements OnInit, AfterViewInit, OnDestroy {
  chartID = 'tradingview-chart-wrapper-' + uuid.v4();

  @Input() series: Array<{
    type: TradingViewChartTypes;
    color: string;
    data: { time: Time; value: number }[];
  }> = [];

  @Input() width = 250;
  @Input() height = 200;

  @Input() options: { [key: string]: any } = {}

  private _chart: IChartApi | null = null;

  seriesList: Array<ISeriesApi<SeriesType>> = []

  constructor(
    private readonly destroy$: DestroyService,
  ) { }
  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.renderChart(this._chart);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initChart();
      this.renderChart(this._chart);
    }, 1e2)
  }

  ngOnDestroy(): void {
    if (this._chart) {
      this._chart.remove();
      this._chart = null;
    }
  }

  private initChart() {
    if (this._chart) {
      return;
    }
    this._chart = createChart(this.chartID, {
      width: this.width,
      height: this.height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      }
    });
  }

  private renderChart(chart: IChartApi | null) {
    if (chart) {
      for (const e of this.seriesList) {
        chart.removeSeries(e)
      }
      this.seriesList = [];

      if (this.options) {
        chart.applyOptions(this.options);
      }

      for (const e of this.series) {
        if (e.type === TradingViewChartTypes.LINE) {
          const lineSeries = chart.addLineSeries({
            color: e.color,
          });
          this.seriesList.push(lineSeries);
          lineSeries.setData(e.data);
        } else if (e.type === TradingViewChartTypes.HISTOGRAM) {
          const histogramSeries = chart.addHistogramSeries({
            color: e.color,
          });
          this.seriesList.push(histogramSeries);
          histogramSeries.setData(e.data);
        } else {
          console.log(`[TradingviewChartComponent] renderChart() known chart type: ${e.type}`)
        }
      }

      chart.timeScale().fitContent();


    }
  }
}
