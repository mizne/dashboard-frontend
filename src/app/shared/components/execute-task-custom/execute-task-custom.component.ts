import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  KlineIntervalService,
  SharedService,
  TimerService,
} from '../../services';
import { merge, startWith, map } from 'rxjs';
import { KlineIntervals } from '../../models/base.model';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'execute-task-custom',
  templateUrl: 'execute-task-custom.component.html',
})
export class ExecuteTaskCustomComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private timerService: TimerService,
    private klineIntervalService: KlineIntervalService,
    private notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

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
    {
      label: 'future',
      name: 'cex-future-daily',
    },
    {
      label: 'token:only-price-change',
      name: 'cex-token-daily:only-price-change',
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
    this.timerService.interval(1)
  ).pipe(
    startWith(this.form.value),
    map(() => {
      return this.resolveEndTime();
    })
  );

  ngOnInit() { }

  submitForm(): void {
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
        return this.klineIntervalService.resolveFourHoursIntervalMills(
          this.form.get('latestIntervals')?.value as number
        );
      case KlineIntervals.ONE_DAY:
        return this.klineIntervalService.resolveOneDayIntervalMills(
          this.form.get('latestIntervals')?.value as number
        );
      default:
        console.warn(
          `intervalTime$ unknown interval: ${this.form.get('interval')?.value}`
        );
        return this.klineIntervalService.resolveFourHoursIntervalMills(
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
}
