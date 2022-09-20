import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { KlineIntervals, KlineIntervalService } from 'src/app/shared';
import { CexTokenTagDaily } from '../../models/cex-token-tag-daily.model';
import { tokenTagNameOfTotalMarket } from '../../models/cex-token-tag.model';
import { CexTokenTagDailyService } from '../../services/cex-token-tag-daily.service';

@Component({
  selector: 'tag-item',
  templateUrl: 'tag-item.component.html',
})
export class TagItemComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexTokenTagDailyService: CexTokenTagDailyService,
    private readonly notification: NzNotificationService,
    private readonly klineIntervalService: KlineIntervalService
  ) {}

  tokenTagNameOfTotalMarket = tokenTagNameOfTotalMarket;

  @Input() formValue: any = null;
  @Input() item: CexTokenTagDaily | null = null;

  showVolumePercentRanking = false;
  volumePercentRankingModalTitle = '';
  volumePercentRankingItems: Array<{
    symbol: string;
    percent: number;
    prevPercent: number;
    color?: string;
    text?: string;
  }> = [];
  volumePercentRankingDescription = '';

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}

  showVolumePercentRankingModal(tagName: string) {
    this.resolveLastIntervalTagDailyItems(tagName).subscribe({
      next: (lastDataItems: CexTokenTagDaily[]) => {
        if (lastDataItems.length === 0) {
          this.showVolumePercentRanking = true;
          this.handleRankingItemsWhenNoLast(tagName);
        } else {
          this.showVolumePercentRanking = true;
          this.handleRankingItemsWhenHasLast(tagName, lastDataItems);
        }
      },
      error: (e: Error) => {
        this.notification.error(
          `获取上一周期${tagName}数据失败`,
          `${e.message}`
        );
      },
    });
  }

  private resolveLastIntervalTagDailyItems(
    tagName: string
  ): Observable<CexTokenTagDaily[]> {
    const o: Partial<CexTokenTagDaily> = {};
    const formValue = this.formValue;
    console.log(`resolveLastIntervalTagDailyItems() formValue: `, formValue);
    if (formValue?.interval) {
      Object.assign(o, { interval: formValue.interval });
    }
    if (formValue?.latestIntervals && formValue.interval) {
      Object.assign(
        o,
        this.resolveLatestIntervals(
          formValue.latestIntervals,
          formValue.interval,
          -1
        )
      );
    }
    return this.cexTokenTagDailyService.queryList(
      {
        name: tagName,
        ...o,
      },
      { number: 1, size: 1 }
    );
  }

  private handleRankingItemsWhenHasLast(
    tagName: string,
    lastDataItems: CexTokenTagDaily[]
  ) {
    if (tagName === tokenTagNameOfTotalMarket) {
      this.volumePercentRankingModalTitle = '全市场token 交易量排行';
    } else {
      const theTag = this.item;
      this.volumePercentRankingModalTitle = theTag
        ? `${theTag.label} 交易量排行`
        : '【未知分类】';
    }

    const theTag = this.item;
    const theLastTag = lastDataItems[0];
    if (theTag) {
      const zippedItems: Array<{
        symbol: string;
        percent: number;
        prevPercent: number;
        newly: boolean;
        delta: number;
      }> = [];

      for (let i = 0; i <= theTag.volumePercents.length - 1; i += 1) {
        const theCurrent = theTag.volumePercents[i];
        const theLastIndex = theLastTag.volumePercents.findIndex(
          (e) => e.token === theCurrent.token
        );
        zippedItems.push({
          symbol: theCurrent.token,
          percent: theCurrent.percent,
          prevPercent:
            theLastIndex === -1
              ? 0
              : theLastTag.volumePercents[theLastIndex].percent,
          newly: theLastIndex === -1,
          delta: theLastIndex === -1 ? 0 : theLastIndex - i,
        });
      }
      this.volumePercentRankingItems = zippedItems.map((e) => {
        const color = e.newly
          ? 'purple'
          : e.delta > 0
          ? 'green'
          : e.delta < 0
          ? 'red'
          : '';
        const text = e.newly
          ? 'new'
          : e.delta > 0
          ? `+${e.delta}`
          : e.delta < 0
          ? `${e.delta}`
          : '0';
        return {
          symbol: e.symbol,
          percent: e.percent,
          prevPercent: e.prevPercent,
          color,
          text,
        };
      });

      this.volumePercentRankingDescription = `${
        zippedItems.filter((e) => !e.newly && e.delta > 0).length
      }↑ ${zippedItems.filter((e) => !e.newly && e.delta < 0).length}↓ ${
        zippedItems.filter((e) => !e.newly && e.delta === 0).length
      }-- ${zippedItems.filter((e) => e.newly).length}new`;
    } else {
      this.volumePercentRankingItems = [];
      this.volumePercentRankingDescription = '--';
    }
  }

  private handleRankingItemsWhenNoLast(tagName: string) {
    if (tagName === tokenTagNameOfTotalMarket) {
      this.volumePercentRankingModalTitle = '全市场token 交易量排行';
      if (this.item) {
        this.volumePercentRankingItems = this.item?.volumePercents.map((e) => {
          const newly = false;
          const delta = 0;
          // const newly = Math.random() > 0.5;
          // const delta =
          //   Math.random() > 0.5
          //     ? Math.floor(Math.random() * 10)
          //     : Math.floor(Math.random() * -10);

          const color = newly
            ? 'purple'
            : delta > 0
            ? 'green'
            : delta < 0
            ? 'red'
            : '';
          const text = newly
            ? 'new'
            : delta > 0
            ? `+${delta}`
            : delta < 0
            ? `${delta}`
            : '0';
          return {
            symbol: e.token,
            percent: e.percent,
            prevPercent: 0,
            color,
            text,
          };
        });

        this.volumePercentRankingDescription = `${
          this.volumePercentRankingItems.filter((e) => e.color === 'green')
            .length
        }↑ ${
          this.volumePercentRankingItems.filter((e) => e.color === 'red').length
        }↓ ${
          this.volumePercentRankingItems.filter((e) => e.color === '').length
        }-- ${
          this.volumePercentRankingItems.filter((e) => e.color === 'purple')
            .length
        }new`;
      }
    } else {
      const theTag = this.item;
      this.volumePercentRankingModalTitle = theTag
        ? `${theTag.label} 交易量排行`
        : '【未知分类】';

      if (theTag) {
        this.volumePercentRankingItems = theTag.volumePercents.map((e) => {
          const newly = false;
          const delta = 0;
          // const newly = Math.random() > 0.5;
          // const delta =
          //   Math.random() > 0.5
          //     ? Math.floor(Math.random() * 10)
          //     : Math.floor(Math.random() * -10);

          const color = newly
            ? 'purple'
            : delta > 0
            ? 'green'
            : delta < 0
            ? 'red'
            : '';
          const text = newly
            ? 'new'
            : delta > 0
            ? `+${delta}`
            : delta < 0
            ? `${delta}`
            : '0';
          return {
            symbol: e.token,
            percent: e.percent,
            prevPercent: 0,
            color,
            text,
          };
        });

        this.volumePercentRankingDescription = `${
          this.volumePercentRankingItems.filter((e) => e.color === 'green')
            .length
        }↑ ${
          this.volumePercentRankingItems.filter((e) => e.color === 'red').length
        }↓ ${
          this.volumePercentRankingItems.filter((e) => e.color === '').length
        }-- ${
          this.volumePercentRankingItems.filter((e) => e.color === 'purple')
            .length
        }new`;
      } else {
        this.volumePercentRankingItems = [];
        this.volumePercentRankingDescription = '--';
      }
    }
  }

  private resolveLatestIntervals(
    latestIntervals: number,
    interval: KlineIntervals,
    deltaInterval: number
  ): { [key: string]: any } {
    if (latestIntervals <= 0) {
      return {};
    }

    const fourHours = 4 * 60 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;

    switch (interval) {
      case KlineIntervals.FOUR_HOURS:
        return {
          time: {
            $gte:
              this.klineIntervalService.resolveFourHoursIntervalMills(
                latestIntervals
              ) +
              deltaInterval * fourHours,
            $lt:
              this.klineIntervalService.resolveFourHoursIntervalMills(
                latestIntervals
              ) +
              fourHours +
              deltaInterval * fourHours,
          },
        };
      case KlineIntervals.ONE_DAY:
        return {
          time: {
            $gte:
              this.klineIntervalService.resolveOneDayIntervalMills(
                latestIntervals
              ) +
              deltaInterval * oneDay,
            $lt:
              this.klineIntervalService.resolveOneDayIntervalMills(
                latestIntervals
              ) +
              oneDay +
              deltaInterval * oneDay,
          },
        };
      default:
        console.warn(`resolveLatestIntervals() unknown interval: ${interval}`);
        return {
          time: {
            $gte:
              this.klineIntervalService.resolveFourHoursIntervalMills(
                latestIntervals
              ) +
              deltaInterval * fourHours,
            $lt:
              this.klineIntervalService.resolveFourHoursIntervalMills(
                latestIntervals
              ) +
              fourHours +
              deltaInterval * fourHours,
          },
        };
    }
  }
}
