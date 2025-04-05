import { Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenVolumeRankingStatistics, CexTokenVolumeRankingStatisticsService, KlineIntervalService, AVAILABLE_CEX_TOKEN_VOLUME_RANKING_IN_DAYS_LIST } from 'src/app/shared';

@Component({
  selector: 'volume-ranking-statistics',
  templateUrl: './volume-ranking-statistics.component.html'
})
export class VolumeRankingStatisticsComponent implements OnInit, OnDestroy {

  inDayss: Array<{
    inDays: number;
    items: Array<CexTokenVolumeRankingStatistics>
  }> = AVAILABLE_CEX_TOKEN_VOLUME_RANKING_IN_DAYS_LIST.map(e => {
    return {
      inDays: e,
      items: []
    }
  })

  constructor(
    private readonly cexTokenVolumeRankingStatisticsService: CexTokenVolumeRankingStatisticsService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder,
    private readonly klineIntervalService: KlineIntervalService
  ) { }


  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnDestroy(): void {

  }
  private async loadChartData() {
    for (const day of this.inDayss) {
      this.cexTokenVolumeRankingStatisticsService.queryList({ inDays: day.inDays })
        .subscribe((items => {
          // console.log(`${day} days, cex token volume ranking statistics items: `, items);

          day.items = items.sort((a, b) => b.countInRanking - a.countInRanking)
        }))
    }
  }






}