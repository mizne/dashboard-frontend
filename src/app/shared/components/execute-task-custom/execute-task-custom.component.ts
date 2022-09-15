import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedService } from '../../services';
import {
  firstValueFrom,
  merge,
  startWith,
  Subscription,
  filter,
  map,
} from 'rxjs';
import { KlineIntervals } from '../../models/base.model';
import { FormBuilder } from '@angular/forms';
import { format, parse } from 'date-fns';
import { paddingZero } from 'src/app/utils';

@Component({
  selector: 'execute-task-custom',
  templateUrl: 'execute-task-custom.component.html',
})
export class ExecuteTaskCustomComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private notification: NzNotificationService,
    private fb: FormBuilder
  ) {}

  visible = false;

  tasks = [
    {
      label: 'token',
      name: 'cex-token-daily',
    },
    {
      label: 'token tag',
      name: 'cex-token-tag-daily',
    },
  ];

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
    task: [this.tasks[0].name],
    interval: [this.intervals[0].name],
    latestIntervals: [1],
  });

  intervalTime$ = merge(
    this.form.valueChanges,
    this.sharedService.interval(1)
  ).pipe(
    startWith(this.form.value),
    map(() => {
      return this.resolveEndTime();
    })
  );

  ngOnInit() {}

  submitForm(): void {
    // console.log('submitForm', this.form.value);
    const task = this.form.get('task')?.value as string;
    const interval = this.form.get('interval')?.value as KlineIntervals;
    const endTime = this.resolveEndTime() + 11 * 1e3;
    this.sharedService.executeTaskCustom(task, interval, endTime).subscribe({
      next: (v) => {
        if (v.code === 0) {
          this.notification.success(`执行任务成功`, `${v.message}`);
        } else {
          this.notification.error(`执行任务失败`, `${v.message}`);
        }
      },
      error: (e: Error) => {
        this.notification.error(`执行任务失败`, `${e.message}`);
      },
    });
  }

  private resolveEndTime(): number {
    switch (this.form.get('interval')?.value) {
      case KlineIntervals.FOUR_HOURS:
        return this.resolveFourHoursIntervalMills(
          this.form.get('latestIntervals')?.value as number
        );
      case KlineIntervals.ONE_DAY:
        return this.resolveOneDayIntervalMills(
          this.form.get('latestIntervals')?.value as number
        );
      default:
        console.warn(
          `intervalTime$ unknown interval: ${this.form.get('interval')?.value}`
        );
        return this.resolveFourHoursIntervalMills(
          this.form.get('latestIntervals')?.value as number
        );
    }
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
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
