import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { format, parse } from 'date-fns';
import { forkJoin, map, startWith } from 'rxjs';
import { paddingZero } from 'src/app/utils';
import { DailyInterval } from '../../models/cex-token-daily.model';
import { CexTokenTagDaily } from '../../models/cex-token-tag-daily.model';
import { CexTokenTag } from '../../models/cex-token-tag.model';
import { CexTokenDailyService } from '../../services/cex-token-daily.service';

@Component({
  selector: 'tag-overview',
  templateUrl: 'tag-overview.component.html',
})
export class TagOverviewComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly cexTokenDailyService: CexTokenDailyService
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

  intervalTime$ = this.form.valueChanges.pipe(
    startWith(this.form.value),
    map(
      () =>
        this.resolveLatestIntervals(
          this.form.value?.latestIntervals as number,
          this.form.value.interval as DailyInterval
        )['time'] || 0
    )
  );

  ngOnInit() {
    this.fetchTagsAndTagDailyItems();
  }

  submitForm(): void {
    console.log('submitForm', this.form.value);
    this.fetchTagsAndTagDailyItems();
  }

  resetForm() {
    this.form.reset({
      interval: this.intervals[0].name,
      latestIntervals: 1,
    });
    console.log('resetForm', this.form.value);
    this.fetchTagsAndTagDailyItems();
  }

  private fetchTagsAndTagDailyItems() {
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
      ).subscribe((items) => {
        this.tagDailyItems = items
          .map((e) => e[0])
          .filter((e) => !!e)
          .sort((a, b) => b.volumeMultiple - a.volumeMultiple);
        console.log(`this.tagDailyItems: `, this.tagDailyItems);
      });
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
          formValue.interval
        )
      );
    }
    return o;
  }

  private resolveLatestIntervals(
    latestIntervals: number,
    interval: DailyInterval
  ): { [key: string]: any } {
    if (latestIntervals <= 0) {
      return {};
    }

    switch (interval) {
      case DailyInterval.FOUR_HOURS:
        return {
          time: this.resolveFourHoursIntervalMills(latestIntervals),
        };
      case DailyInterval.ONE_DAY:
        return {
          time: this.resolveOneDayIntervalMills(latestIntervals),
        };
      default:
        console.warn(`resolveLatestIntervals() unknown interval: ${interval}`);
        return {
          time: this.resolveFourHoursIntervalMills(latestIntervals),
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
