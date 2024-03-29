import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { KlineIntervals, KlineIntervalService } from 'src/app/shared';
import { resolvePriceStatus } from 'src/app/utils';
import { CexTokenTagDaily } from 'src/app/shared';
import { tokenTagNameOfTotalMarket } from 'src/app/shared';
import { CexTokenTagDailyService } from 'src/app/shared';

interface RankingItem {
  symbol: string;
  percent: number;
  volume: number;
  prevPercent: number;
  prevVolume: number;

  priceStatus: string;
  prevPriceStatus: string;
  color?: string;
  text?: string;
}

@Component({
  selector: 'tag-item',
  templateUrl: 'tag-item.component.html',
})
export class TagItemComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexTokenTagDailyService: CexTokenTagDailyService,
    private readonly notification: NzNotificationService,
    private readonly klineIntervalService: KlineIntervalService
  ) { }

  tokenTagNameOfTotalMarket = tokenTagNameOfTotalMarket;

  @Input() formValue: any = null;
  @Input() item: CexTokenTagDaily | null = null;

  showModal = false;
  modalTitle = '';
  rankingItems: Array<RankingItem> = [];
  modalListDescription = '';

  filterCtrl = new FormControl('');
  filteredRankingItems: Array<RankingItem> = [];

  allOptions = [
    {
      label: '趋势转折',
      children: [
        {
          label: '空头 -> 震荡',
          value: '空头 -> 震荡',
        },
        {
          label: '震荡 -> 多头',
          value: '震荡 -> 多头',
        },
        {
          label: '空头 -> 多头',
          value: '空头 -> 多头',
        },
        {
          label: '多头 -> 震荡',
          value: '多头 -> 震荡',
        },
        {
          label: '震荡 -> 空头',
          value: '震荡 -> 空头',
        },
        {
          label: '多头 -> 空头',
          value: '多头 -> 空头',
        },
      ],
    },
    {
      label: '价格形态',
      children: [
        {
          label: '多头',
          value: '多头',
        },
        {
          label: '多头密集',
          value: '多头密集',
        },
        {
          label: '空头',
          value: '空头',
        },
        {
          label: '空头密集',
          value: '空头密集',
        },
        {
          label: '震荡',
          value: '震荡',
        },
        {
          label: '震荡密集',
          value: '震荡密集',
        },
      ],
    },
  ];
  filteredOptions = this.allOptions.slice(0);

  prevPriceStatusChartData: Array<{
    label: string;
    value: number;
    color?: string;
  }> = [];
  priceStatusChartData: Array<{
    label: string;
    value: number;
    color?: string;
  }> = [];

  descriptions: Array<{
    title: string;
    color: string;
    label: string;
    rankingItems: Array<RankingItem>;
  }> = [
      {
        title: '空头->震荡',
        color: '#b7eb8f',
        label: '空转多',
        rankingItems: [],
      },
      {
        title: '震荡->多头',
        color: '#b7eb8f',
        label: '空转多',
        rankingItems: [],
      },
      {
        title: '空头->多头',
        color: '#b7eb8f',
        label: '空转多',
        rankingItems: [],
      },
      {
        title: '多头->震荡',
        color: '#ffa39e',
        label: '多转空',
        rankingItems: [],
      },
      {
        title: '震荡->空头',
        color: '#ffa39e',
        label: '多转空',
        rankingItems: [],
      },
      {
        title: '多头->空头',
        color: '#ffa39e',
        label: '多转空',
        rankingItems: [],
      },
    ];

  ngOnInit() {
    this.filterCtrl.valueChanges.subscribe((v) => {
      const reg = new RegExp(this.filterCtrl.value || '', 'i');
      this.filteredOptions = this.allOptions
        .filter((group) => {
          const has = group.children.find((e) => reg.test(e.value));
          return !!has;
        })
        .map((group) => {
          return {
            label: group.label,
            children: group.children.filter((e) => reg.test(e.value)),
          };
        });
    });
  }

  ngOnChanges(changes: SimpleChanges): void { }

  toFilter() {
    this.filterRankingItems();
  }

  showVolumePercentRankingModal(tagName: string) {
    this.resolveLastIntervalTagDailyItems(tagName).subscribe({
      next: (lastDataItems: CexTokenTagDaily[]) => {
        if (lastDataItems.length === 0) {
          this.showModal = true;
          this.handleRankingItemsWhenNoLast(tagName);
        } else {
          this.showModal = true;
          this.handleRankingItemsWhenHasLast(tagName, lastDataItems);
        }

        this.resolvePriceStatusChartData();
        this.resolveStatsData();
        this.filterRankingItems();
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
      this.modalTitle = '全市场';
    } else {
      const theTag = this.item;
      this.modalTitle = theTag ? `${theTag.label}` : '【未知分类】';
    }

    const theTag = this.item;
    const theLastTag = lastDataItems[0];
    if (theTag) {
      const zippedItems: Array<{
        symbol: string;
        emaCompression?: {
          token: string;
          closeDeltaEma21: number;
          ema21DeltaEma55: number;
          ema55DeltaEma144: number;
          emaCompressionRelative: number;
        };
        prevEMACompression?: {
          token: string;
          closeDeltaEma21: number;
          ema21DeltaEma55: number;
          ema55DeltaEma144: number;
          emaCompressionRelative: number;
        };
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
        const theEMACompression = (theTag.emaCompressions || []).find(
          (e) => e.token === theCurrent.token
        );
        const prevEMACompression = (theLastTag.emaCompressions || []).find(
          (e) => e.token === theCurrent.token
        );

        zippedItems.push({
          symbol: theCurrent.token,
          emaCompression: theEMACompression,
          prevEMACompression: prevEMACompression,
          percent: theCurrent.percent,
          prevPercent:
            theLastIndex === -1
              ? 0
              : theLastTag.volumePercents[theLastIndex].percent,
          newly: theLastIndex === -1,
          delta: theLastIndex === -1 ? 0 : theLastIndex - i,
        });
      }
      this.rankingItems = zippedItems.map((e) => {
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
          volume: e.percent * theTag.volume,
          prevPercent: e.prevPercent,
          prevVolume: e.prevPercent * theLastTag.volume,

          priceStatus: e.emaCompression
            ? this.resolvePriceStatus(
              e.emaCompression.closeDeltaEma21,
              e.emaCompression.ema21DeltaEma55,
              e.emaCompression.ema55DeltaEma144,
              e.emaCompression.emaCompressionRelative
            )
            : '',
          prevPriceStatus: e.prevEMACompression
            ? this.resolvePriceStatus(
              e.prevEMACompression.closeDeltaEma21,
              e.prevEMACompression.ema21DeltaEma55,
              e.prevEMACompression.ema55DeltaEma144,
              e.prevEMACompression.emaCompressionRelative
            )
            : '',
          color,
          text,
        };
      });

      this.modalListDescription = `${zippedItems.filter((e) => !e.newly && e.delta > 0).length
        }↑ ${zippedItems.filter((e) => !e.newly && e.delta < 0).length}↓ ${zippedItems.filter((e) => !e.newly && e.delta === 0).length
        }-- ${zippedItems.filter((e) => e.newly).length}new`;
    } else {
      this.rankingItems = [];
      this.modalListDescription = '--';
    }
  }

  private handleRankingItemsWhenNoLast(tagName: string) {
    if (tagName === tokenTagNameOfTotalMarket) {
      this.modalTitle = '全市场';
      if (this.item) {
        this.rankingItems = this.item?.volumePercents.map((e) => {
          const newly = false;
          const delta = 0;
          // const newly = Math.random() > 0.5;
          // const delta =
          //   Math.random() > 0.5
          //     ? Math.floor(Math.random() * 10)
          //     : Math.floor(Math.random() * -10);

          const theEMACompression = this.item?.emaCompressions.find(
            (f) => f.token === e.token
          );

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
            volume: (this.item?.volume || 0) * e.percent,
            percent: e.percent,
            prevPercent: 0,
            prevVolume: 0,

            priceStatus: theEMACompression
              ? this.resolvePriceStatus(
                theEMACompression.closeDeltaEma21,
                theEMACompression.ema21DeltaEma55,
                theEMACompression.ema55DeltaEma144,
                theEMACompression.emaCompressionRelative
              )
              : '',
            prevPriceStatus: '',
            color,
            text,
          };
        });

        this.modalListDescription = `${this.rankingItems.filter((e) => e.color === 'green').length
          }↑ ${this.rankingItems.filter((e) => e.color === 'red').length}↓ ${this.rankingItems.filter((e) => e.color === '').length
          }-- ${this.rankingItems.filter((e) => e.color === 'purple').length}new`;
      }
    } else {
      const theTag = this.item;
      this.modalTitle = theTag ? `${theTag.label}` : '【未知分类】';

      if (theTag) {
        this.rankingItems = theTag.volumePercents.map((e) => {
          const newly = false;
          const delta = 0;
          // const newly = Math.random() > 0.5;
          // const delta =
          //   Math.random() > 0.5
          //     ? Math.floor(Math.random() * 10)
          //     : Math.floor(Math.random() * -10);
          const theEMACompression = this.item?.emaCompressions.find(
            (f) => f.token === e.token
          );

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
            volume: (this.item?.volume || 0) * e.percent,
            percent: e.percent,
            prevPercent: 0,
            prevVolume: 0,

            priceStatus: theEMACompression
              ? this.resolvePriceStatus(
                theEMACompression.closeDeltaEma21,
                theEMACompression.ema21DeltaEma55,
                theEMACompression.ema55DeltaEma144,
                theEMACompression.emaCompressionRelative
              )
              : '',
            prevPriceStatus: '',
            color,
            text,
          };
        });

        this.modalListDescription = `${this.rankingItems.filter((e) => e.color === 'green').length
          }↑ ${this.rankingItems.filter((e) => e.color === 'red').length}↓ ${this.rankingItems.filter((e) => e.color === '').length
          }-- ${this.rankingItems.filter((e) => e.color === 'purple').length}new`;
      } else {
        this.rankingItems = [];
        this.modalListDescription = '--';
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

  private resolvePriceStatus(
    closeDeltaEma21: number,
    ema21DeltaEma55: number,
    ema55DeltaEma144: number,
    emaCompressionRelative: number
  ): string {
    const statusGen = (
      closeDeltaEma21: number,
      ema21DeltaEma55: number,
      ema55DeltaEma144: number,
      emaCompressionRelative: number
    ) => {
      const status = resolvePriceStatus(
        closeDeltaEma21,
        ema21DeltaEma55,
        ema55DeltaEma144
      );
      return {
        status: status,
        compression: emaCompressionRelative,
      };
    };

    const status = statusGen(
      closeDeltaEma21,
      ema21DeltaEma55,
      ema55DeltaEma144,
      emaCompressionRelative
    );

    const prefix =
      status.status === 'long'
        ? '多头'
        : status.status === 'short'
          ? '空头'
          : '震荡';

    const suffix =
      status.compression <= 0.1
        ? '密集'
        : status.compression >= 0.9
          ? '极限乖离'
          : '';

    return prefix + suffix;
  }

  private resolvePriceStatusChartData() {
    const prevPriceStatusChartData = this.rankingItems.reduce<
      Array<{ label: string; value: number }>
    >((accu, curr) => {
      const theSame = accu.find(
        (e) => e.label === this.resolveLabel(curr.prevPriceStatus)
      );
      if (theSame) {
        theSame.value += 1;
      } else {
        accu.push({ label: this.resolveLabel(curr.prevPriceStatus), value: 1 });
      }
      return accu;
    }, []);

    const priceStatusChartData = this.rankingItems.reduce<
      Array<{ label: string; value: number }>
    >((accu, curr) => {
      const theSame = accu.find(
        (e) => e.label === this.resolveLabel(curr.priceStatus)
      );
      if (theSame) {
        theSame.value += 1;
      } else {
        accu.push({ label: this.resolveLabel(curr.priceStatus), value: 1 });
      }
      return accu;
    }, []);

    this.prevPriceStatusChartData = prevPriceStatusChartData.map((e) => ({
      label: e.label,
      value: e.value,
      color: this.resolveColor(e.label),
    }));
    this.priceStatusChartData = priceStatusChartData.map((e) => ({
      label: e.label,
      value: e.value,
      color: this.resolveColor(e.label),
    }));
  }

  private resolveStatsData() {
    this.descriptions.forEach((desc) => {
      const [prevPriceStatus, priceStatus] = desc.title
        .split('->')
        .map((e) => e.trim());
      desc.rankingItems = this.rankingItems.filter(
        (e) =>
          e.prevPriceStatus.indexOf(prevPriceStatus) >= 0 &&
          e.priceStatus.indexOf(priceStatus) >= 0
      );
    });
  }

  private filterRankingItems() {
    this.filteredRankingItems = this.rankingItems.filter((e) => {
      const value = this.filterCtrl.value || '';
      if (value.indexOf('->') >= 0) {
        const [prev, curr] = value.split('->').map((e) => e.trim());
        const matchedPrevPriceStatus = new RegExp(prev, 'i').test(
          e.prevPriceStatus
        );
        const matchedPriceStatus = new RegExp(curr, 'i').test(e.priceStatus);
        return matchedPrevPriceStatus && matchedPriceStatus;
      } else {
        const reg = new RegExp(value, 'i');
        const matchedSymbol = reg.test(e.symbol);
        const matchedPrevPriceStatus = reg.test(e.prevPriceStatus);
        const matchedPriceStatus = reg.test(e.priceStatus);
        return matchedSymbol || matchedPrevPriceStatus || matchedPriceStatus;
      }
    });
  }

  private resolveLabel(s: string) {
    return s.slice(0, 2);
  }

  private resolveColor(label: string): string {
    return label === '多头'
      ? '#b7eb8f'
      : label === '空头'
        ? '#ffa39e'
        : '#47abfc';
  }
}
