import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { format, parse } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin, map, merge, Observable, startWith } from 'rxjs';
import { SharedService } from 'src/app/shared';
import { paddingZero } from 'src/app/utils';
import { DailyInterval } from '../../models/cex-token-daily.model';
import { CexTokenTagDaily } from '../../models/cex-token-tag-daily.model';
import {
  CexTokenTag,
  tokenTagNameOfTotalMarket,
} from '../../models/cex-token-tag.model';
import { CexTokenDailyService } from '../../services/cex-token-daily.service';

@Component({
  selector: 'tag-overview',
  templateUrl: 'tag-overview.component.html',
})
export class TagOverviewComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly sharedService: SharedService,
    private readonly cexTokenDailyService: CexTokenDailyService,
    private readonly notification: NzNotificationService
  ) {}

  intervals = [
    {
      label: '4h',
      name: DailyInterval.FOUR_HOURS,
    },
    {
      label: '1d',
      name: DailyInterval.ONE_DAY,
    },
  ];
  form = this.fb.group({
    interval: [this.intervals[0].name],
    latestIntervals: [1],
  });

  tagDailyItems: Array<CexTokenTagDaily> = [];
  loading = false;
  status: 'loading' | 'error' | 'success' | '' = '';

  totalMarketTagDailyItem: CexTokenTagDaily | undefined = undefined;
  tokenTagNameOfTotalMarket = tokenTagNameOfTotalMarket;
  otherTagDailyItems: Array<CexTokenTagDaily> = [];

  showVolumePercentRanking = false;
  volumePercentRankingModalTitle = '';
  volumePercentRankingItems: Array<{
    symbol: string;
    percent: number;
    color?: string;
    text?: string;
  }> = [];

  intervalTime$ = merge(
    this.form.valueChanges,
    this.sharedService.interval(1)
  ).pipe(
    startWith(this.form.value),
    map(() => {
      switch (this.form.get('interval')?.value) {
        case DailyInterval.FOUR_HOURS:
          return this.resolveFourHoursIntervalMills(
            this.form.get('latestIntervals')?.value as number
          );
        case DailyInterval.ONE_DAY:
          return this.resolveOneDayIntervalMills(
            this.form.get('latestIntervals')?.value as number
          );
        default:
          console.warn(
            `intervalTime$ unknown interval: ${
              this.form.get('interval')?.value
            }`
          );
          return this.resolveFourHoursIntervalMills(
            this.form.get('latestIntervals')?.value as number
          );
      }
    })
  );

  ngOnInit() {
    this.fetchTagsAndTagDailyItems();
  }

  submitForm(): void {
    // console.log('submitForm', this.form.value);
    this.fetchTagsAndTagDailyItems();
  }

  resetForm() {
    this.form.reset({
      interval: this.intervals[0].name,
      latestIntervals: 1,
    });
    // console.log('resetForm', this.form.value);
    this.fetchTagsAndTagDailyItems();
  }

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

  private handleRankingItemsWhenHasLast(
    tagName: string,
    lastDataItems: CexTokenTagDaily[]
  ) {
    if (tagName === this.tokenTagNameOfTotalMarket) {
      this.volumePercentRankingModalTitle = '全市场token 交易量排行';
    } else {
      const theTag = this.otherTagDailyItems.find((e) => e.name === tagName);
      this.volumePercentRankingModalTitle = theTag
        ? `${theTag.label} 交易量排行`
        : '【未知分类】';
    }

    const theTag = this.tagDailyItems.find((e) => e.name === tagName);
    const theLastTag = lastDataItems[0];
    if (theTag) {
      const zippedItems: Array<{
        symbol: string;
        percent: number;
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
          color,
          text,
        };
      });
    } else {
      this.volumePercentRankingItems = [];
    }
  }

  private handleRankingItemsWhenNoLast(tagName: string) {
    if (tagName === this.tokenTagNameOfTotalMarket) {
      this.volumePercentRankingModalTitle = '全市场token 交易量排行';
      if (this.totalMarketTagDailyItem) {
        this.volumePercentRankingItems =
          this.totalMarketTagDailyItem?.volumePercents.map((e) => {
            const newly = false;
            const delta = 0;

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
              color,
              text,
            };
          });
      }
    } else {
      const theTag = this.otherTagDailyItems.find((e) => e.name === tagName);
      this.volumePercentRankingModalTitle = theTag
        ? `${theTag.label} 交易量排行`
        : '【未知分类】';

      if (theTag) {
        this.volumePercentRankingItems = theTag.volumePercents.map((e) => {
          const newly = false;
          const delta = 0;

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
            color,
            text,
          };
        });
      } else {
        this.volumePercentRankingItems = [];
      }
    }
  }

  private fetchTagsAndTagDailyItems() {
    this.loading = true;
    this.status = 'loading';
    this.cexTokenDailyService.queryTags().subscribe((tags) => {
      forkJoin(
        tags.map((tag) =>
          this.cexTokenDailyService.queryTagDaily(
            {
              name: tag.name,
              ...this.resolveFormValue(),
            },
            { number: 1, size: 1 }
          )
        )
      ).subscribe(
        (items) => {
          this.loading = false;
          this.status = 'success';
          this.tagDailyItems = items
            .map((e) => e[0])
            .filter((e) => !!e)
            .sort((a, b) => b.volumeMultiple - a.volumeMultiple);
          // console.log(`this.tagDailyItems: `, this.tagDailyItems);

          this.totalMarketTagDailyItem = this.tagDailyItems.find(
            (e) => e.name === tokenTagNameOfTotalMarket
          );
          this.otherTagDailyItems = this.tagDailyItems.filter(
            (e) => e.name !== tokenTagNameOfTotalMarket
          );
        },
        (e: Error) => {
          this.notification.error(`获取失败`, `${e.message}`);
          this.loading = false;
          this.status = 'error';
        }
      );
    });
  }

  private resolveLastIntervalTagDailyItems(
    tagName: string
  ): Observable<CexTokenTagDaily[]> {
    const o: Partial<CexTokenTagDaily> = {};
    const formValue = this.form.value;
    if (formValue.interval) {
      Object.assign(o, { interval: formValue.interval });
    }
    if (formValue.latestIntervals && formValue.interval) {
      Object.assign(
        o,
        this.resolveLatestIntervals(
          formValue.latestIntervals,
          formValue.interval,
          -1
        )
      );
    }
    return this.cexTokenDailyService.queryTagDaily(
      {
        name: tagName,
        ...o,
      },
      { number: 1, size: 1 }
    );
  }

  private resolveFormValue(): Partial<CexTokenTagDaily> {
    const o: Partial<CexTokenTagDaily> = {};
    const formValue = this.form.value;
    if (formValue.interval) {
      Object.assign(o, { interval: formValue.interval });
    }
    if (formValue.latestIntervals && formValue.interval) {
      Object.assign(
        o,
        this.resolveLatestIntervals(
          formValue.latestIntervals,
          formValue.interval,
          0
        )
      );
    }
    return o;
  }

  private resolveLatestIntervals(
    latestIntervals: number,
    interval: DailyInterval,
    deltaInterval: number
  ): { [key: string]: any } {
    if (latestIntervals <= 0) {
      return {};
    }

    const fourHours = 4 * 60 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;

    switch (interval) {
      case DailyInterval.FOUR_HOURS:
        return {
          time: {
            $gte:
              this.resolveFourHoursIntervalMills(latestIntervals) +
              deltaInterval * fourHours,
            $lt:
              this.resolveFourHoursIntervalMills(latestIntervals) +
              fourHours +
              deltaInterval * fourHours,
          },
        };
      case DailyInterval.ONE_DAY:
        return {
          time: {
            $gte:
              this.resolveOneDayIntervalMills(latestIntervals) +
              deltaInterval * oneDay,
            $lt:
              this.resolveOneDayIntervalMills(latestIntervals) +
              oneDay +
              deltaInterval * oneDay,
          },
        };
      default:
        console.warn(`resolveLatestIntervals() unknown interval: ${interval}`);
        return {
          time: {
            $gte:
              this.resolveFourHoursIntervalMills(latestIntervals) +
              deltaInterval * fourHours,
            $lt:
              this.resolveFourHoursIntervalMills(latestIntervals) +
              fourHours +
              deltaInterval * fourHours,
          },
        };
    }
  }

  private resolveFourHoursIntervalMills(latestIntervals: number): number {
    const fourHours = 4 * 60 * 60 * 1e3;
    const hours = [0, 4, 8, 12, 16, 20];
    const currentHour = new Date().getHours();
    const theHourIndex = hours.findIndex((e) => e > currentHour);
    const theHour =
      theHourIndex >= 0 ? hours[theHourIndex - 1] : hours[hours.length - 1];

    const theMills = parse(
      format(new Date(), 'yyyy-MM-dd') +
        ` ${paddingZero(String(theHour))}:00:00`,
      'yyyy-MM-dd HH:mm:ss',
      new Date()
    ).getTime();

    return theMills - (latestIntervals - 1) * fourHours;
  }

  private resolveOneDayIntervalMills(latestIntervals: number): number {
    const oneDay = 24 * 60 * 60 * 1e3;
    const currentHour = new Date().getHours();
    if (currentHour >= 8) {
      // 返回当天08:00:00的时间戳 及天数差值
      return (
        parse(
          format(new Date(), 'yyyy-MM-dd') + ' 08:00:00',
          'yyyy-MM-dd HH:mm:ss',
          new Date()
        ).getTime() -
        (latestIntervals - 1) * oneDay
      );
    } else {
      // 返回前一天08:00:00的时间戳 及天数差值
      return (
        parse(
          format(new Date().getTime() - oneDay, 'yyyy-MM-dd') + ' 08:00:00',
          'yyyy-MM-dd HH:mm:ss',
          new Date()
        ).getTime() -
        (latestIntervals - 1) * oneDay
      );
    }
  }
}
