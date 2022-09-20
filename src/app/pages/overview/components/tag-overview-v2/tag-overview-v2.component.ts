import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin, map, merge, Observable, startWith } from 'rxjs';
import {
  KlineIntervals,
  KlineIntervalService,
  SharedService,
  TimerService,
} from 'src/app/shared';
import { CexTokenTagDaily } from '../../models/cex-token-tag-daily.model';
import { tokenTagNameOfTotalMarket } from '../../models/cex-token-tag.model';
import { CexTokenTagDailyService } from '../../services/cex-token-tag-daily.service';
import { CexTokenTagService } from '../../services/cex-token-tag.service';

@Component({
  selector: 'tag-overview-v2',
  templateUrl: 'tag-overview-v2.component.html',
})
export class TagOverviewV2Component implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly sharedService: SharedService,
    private readonly timerService: TimerService,
    private readonly klineIntervalService: KlineIntervalService,
    private readonly cexTokenTagService: CexTokenTagService,
    private readonly cexTokenTagDailyService: CexTokenTagDailyService,
    private readonly notification: NzNotificationService
  ) {}

  intervals = [
    {
      label: '4h',
      name: KlineIntervals.FOUR_HOURS,
    },
    {
      label: '1d',
      name: KlineIntervals.ONE_DAY,
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
  otherTagDailyItems: Array<CexTokenTagDaily> = [];

  intervalTime$ = merge(
    this.form.valueChanges,
    this.timerService.interval(1)
  ).pipe(
    startWith(this.form.value),
    map(() => {
      switch (this.form.get('interval')?.value) {
        case KlineIntervals.FOUR_HOURS:
          return this.klineIntervalService.resolveFourHoursIntervalMills(
            this.form.get('latestIntervals')?.value as number
          );
        case KlineIntervals.ONE_DAY:
          return this.klineIntervalService.resolveOneDayIntervalMills(
            this.form.get('latestIntervals')?.value as number
          );
        default:
          console.warn(
            `intervalTime$ unknown interval: ${
              this.form.get('interval')?.value
            }`
          );
          return this.klineIntervalService.resolveFourHoursIntervalMills(
            this.form.get('latestIntervals')?.value as number
          );
      }
    })
  );

  ngOnInit() {
    this.fetchTagsAndTagDailyItems();
  }

  submitForm(): void {
    this.fetchTagsAndTagDailyItems();
  }

  resetForm() {
    this.form.reset({
      interval: this.intervals[0].name,
      latestIntervals: 1,
    });
    this.fetchTagsAndTagDailyItems();
  }

  private fetchTagsAndTagDailyItems() {
    this.loading = true;
    this.status = 'loading';
    this.cexTokenTagService.queryList().subscribe({
      next: (tags) => {
        forkJoin(
          tags.map((tag) =>
            this.cexTokenTagDailyService.queryList(
              {
                name: tag.name,
                ...this.resolveFormValue(),
              },
              { number: 1, size: 1 }
            )
          )
        ).subscribe({
          next: (items) => {
            this.loading = false;
            this.status = 'success';
            this.tagDailyItems = items
              .map((e) => e[0])
              .filter((e) => !!e)
              .sort((a, b) => b.volumeMultiple - a.volumeMultiple);

            this.totalMarketTagDailyItem = this.tagDailyItems.find(
              (e) => e.name === tokenTagNameOfTotalMarket
            );
            this.otherTagDailyItems = this.tagDailyItems.filter(
              (e) => e.name !== tokenTagNameOfTotalMarket
            );
          },
          error: (e: Error) => {
            this.notification.error(`获取失败`, `${e.message}`);
            this.loading = false;
            this.status = 'error';
          },
        });
      },
      error: (e: Error) => {
        this.notification.error(`获取 token tag 失败`, `${e.message}`);
        this.loading = false;
        this.status = 'error';
      },
    });
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
