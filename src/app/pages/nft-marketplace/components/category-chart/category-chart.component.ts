import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Chart, registerTheme } from '@antv/g2';
import { merge, Observable } from 'rxjs';
import * as uuid from 'uuid';
import { NFTMarketplaceService } from '../../services/nft-marketplace.service';
import { FloorPrice } from '../../models/floor-price.model';
import { Statistics } from '../../models/statistics.model';
import { today } from 'src/app/utils';

// registerTheme('customTheme', {
//   styleSheet: {
//     brandColor: '#673ab7',
//   },
// });

@Component({
  selector: 'category-chart',
  templateUrl: 'category-chart.component.html',
  styleUrls: ['./category-chart.component.scss'],
})
export class CategoryChartComponent implements OnInit, AfterViewInit {
  constructor(private nftMarketplaceService: NFTMarketplaceService) {}
  private initialed = false;
  private _chain: string | null = '';
  @Input() projectName = '';
  @Input()
  set chain(v: string | null) {
    this._chain = v;

    if (this.initialed) {
      this.rerenderCharts();
    }
  }
  get chain(): string | null {
    return this._chain;
  }

  @Input() category: string = '';
  @Input() filters: Array<{ label: string; options: string[] }> = [];

  filterControls: Array<{ key: string; ctrl: FormControl; options: string[] }> =
    [];

  floorPriceChart: Chart | null = null;
  floorPriceID = uuid.v4();
  floorPriceLastUpdateAtStr = '';
  statisticsChart: Chart | null = null;
  statisticsID = uuid.v4();
  statisticsLastUpdateAtStr = '';

  ngOnInit() {
    this.filterControls = this.filters.map((e) => ({
      key: e.label,
      ctrl: new FormControl(e.options[0]),
      options: e.options,
    }));
  }

  ngAfterViewInit(): void {
    this.initialed = true;
    this.initCharts();
    this.rerenderChartsWhenQueryChange();
  }

  private initCharts() {
    this.initFloorPriceChart();
    this.initStatisticsChart();
  }

  private rerenderChartsWhenQueryChange() {
    merge(...this.filterControls.map((e) => e.ctrl.valueChanges)).subscribe(
      () => {
        this.rerenderCharts();
      }
    );
  }

  private rerenderCharts() {
    if (this.floorPriceChart) {
      this.fetchFloorPrices().subscribe((data) => {
        this.floorPriceChart?.clear();
        this.renderFloorPriceChart(this.floorPriceChart, data);
      });
    }

    if (this.statisticsChart) {
      this.fetchStatistics().subscribe((data) => {
        this.statisticsChart?.clear();
        this.renderStatisticsChart(this.statisticsChart, data);
      });
    }
  }

  private initFloorPriceChart() {
    this.fetchFloorPrices().subscribe((floorPrices) => {
      const data = floorPrices;

      const chart = new Chart({
        container: this.floorPriceID,
        autoFit: true,
        height: 250,
        padding: [50, 20, 50, 20],
        theme: {
          styleSheet: {
            brandColor: '#673ab7',
          },
        },
      });
      this.renderFloorPriceChart(chart, data);
      this.floorPriceChart = chart;
    });
  }

  private renderFloorPriceChart(chart: Chart | null, data: any[]) {
    data = data.slice(-7);
    chart?.data(data);
    chart?.scale('priceAmount', {
      alias: '地板价',
    });

    chart?.axis('timeStr', {
      tickLine: {
        alignTick: false,
      },
    });
    chart?.axis('priceAmount', false);

    chart?.tooltip({
      showMarkers: false,
    });
    chart?.interval().position('timeStr*priceAmount');
    chart?.interaction('element-active');

    // 添加文本标注
    data.forEach((item, index) => {
      chart?.annotation().text({
        position: [item.timeStr, item.priceAmount],
        content: item.priceAmount + ' ' + item.priceUnit,
        style: {
          textAlign: 'center',
        },
        offsetY: -10 * (index % 2 === 0 ? 1 : 3),
      });
    });
    chart?.render();

    if (data.length > 0) {
      this.floorPriceLastUpdateAtStr = data[data.length - 1].createdAtStr;
    }
  }

  private initStatisticsChart() {
    this.fetchStatistics().subscribe((items) => {
      const data = items;

      const chart = new Chart({
        container: this.statisticsID,
        autoFit: true,
        height: 250,
        padding: [50, 20, 50, 20],
        theme: {
          styleSheet: {
            brandColor: 'green',
          },
        },
      });

      this.renderStatisticsChart(chart, data);
      this.statisticsChart = chart;
    });
  }

  private renderStatisticsChart(chart: Chart | null, data: any[]) {
    data = data.slice(-7);
    chart?.data(data);
    chart?.scale('totalCount', {
      alias: '总量',
    });

    chart?.axis('timeStr', {
      tickLine: {
        alignTick: false,
      },
    });
    chart?.axis('totalCount', false);

    chart?.tooltip({
      showMarkers: false,
    });
    chart?.interval().position('timeStr*totalCount');
    chart?.interaction('element-active');

    // 添加文本标注
    data.forEach((item) => {
      chart?.annotation().text({
        position: [item.timeStr, item.totalCount],
        content: item.totalCount + ' 个',
        style: {
          textAlign: 'center',
        },
        offsetY: -10,
      });
    });
    chart?.render();

    if (data.length > 0) {
      this.statisticsLastUpdateAtStr = data[data.length - 1].createdAtStr;
    }
  }

  private fetchFloorPrices(): Observable<Array<FloorPrice>> {
    return this.nftMarketplaceService.fetchFloorPrices(
      this.projectName,
      this.chain || '',
      this.category,
      this.resolveQuery()
    );
  }

  private fetchStatistics(): Observable<Array<Statistics>> {
    return this.nftMarketplaceService.fetchStatistics(
      this.projectName,
      this.chain || '',
      this.category,
      this.resolveQuery()
    );
  }

  private resolveQuery(): { [key: string]: any } {
    const todayMs = today();
    const result: { [key: string]: any } = {
      time: { $gte: todayMs - 6 * 24 * 60 * 60 * 1000 },
    };
    for (const filterCtrl of this.filterControls) {
      Object.assign(result, {
        [this.captial(this.category, filterCtrl.key)]: filterCtrl.ctrl.value,
      });
    }
    return result;
  }

  private captial(prefix: string, suffix: string): string {
    return prefix + suffix.slice(0, 1).toUpperCase() + suffix.slice(1);
  }
}
