import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotifyObserver, NotifyObserverService, NotifyObserverTypes, TimerService } from 'src/app/shared';
import { CreateNotifyObserverService, NotifyObserverModalActions } from 'src/app/modules/create-notify-observer'
import { DestroyService } from 'src/app/shared/services/destroy.service';
import { startWith, takeUntil } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { paddingZero } from 'src/app/utils';

enum TaskTypes {
  TODAY = 'today',
  TOMORROW = 'TOMORROW',
  THIS_MONTH = 'THIS_MONTH',
  NOT_TODAY = 'not today',
  ALL = 'all'
}

@Component({
  selector: 'timer-notify-observer-modal',
  templateUrl: 'timer-notify-observer-modal.component.html',
  providers: [DestroyService]
})

export class TimerNotifyObserverModalComponent implements OnInit {
  constructor(
    private readonly service: NotifyObserverService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly notifyObserverService: NotifyObserverService,
    private readonly destroyService: DestroyService,
    private readonly timerService: TimerService,
    private readonly fb: FormBuilder,
  ) { }

  visible = false;
  nowHour = '';

  times: Array<Array<{
    hour: string;
    items: Array<NotifyObserver>
  }>> = []

  taskTypes = [
    {
      label: '今天',
      value: TaskTypes.TODAY,
      title: '包括今天的任务'
    },
    {
      label: '明天',
      value: TaskTypes.TOMORROW,
      title: '包括明天的任务'
    },
    {
      label: '本月',
      value: TaskTypes.THIS_MONTH,
      title: '本月的任务，排除今天、明天'
    },
    // {
    //   label: '非今天',
    //   value: TaskTypes.NOT_TODAY
    // },
    {
      label: '所有',
      value: TaskTypes.ALL,
      title: '所有的任务'
    }
  ]
  form = this.fb.group({
    taskType: [this.taskTypes[0].value]
  })

  ngOnInit() {
    this.subscribeNowHourChange();
    this.subscribeFormChange();
  }

  open() {
    this.visible = true;

    this.fetchTimerNotifyObservers();
  }

  tooltipGetter(hour: string, item: NotifyObserver) {
    return `${hour}:${(item.timerMinute || []).map(e => paddingZero(String(e))).join(',')} / 点击编辑`
  }

  confirmCreate() {
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
      type: NotifyObserverTypes.TIMER
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '添加通知源',
      obj,
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`添加通知源成功`, `添加通知源成功`);
      this.fetchTimerNotifyObservers();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加通知源失败`, `${e.message}`);
    });
  }

  confirmUpdate(item: NotifyObserver) {
    const obj: Partial<NotifyObserver> = {
      ...item,
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '修改通知源',
      obj,
      NotifyObserverModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`修改通知源成功`, `修改通知源成功`);
      this.fetchTimerNotifyObservers();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`修改通知源失败`, `${e.message}`);
    });
  }

  confirmDelete(item: NotifyObserver) {
    this.notifyObserverService.deleteByID(item._id).subscribe({
      next: () => {
        this.nzNotificationService.success(`删除成功`, `删除数据成功`);
        this.fetchTimerNotifyObservers();
      },
      complete: () => { },
      error: (e) => {
        this.nzNotificationService.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  private subscribeNowHourChange() {
    this.timerService.interval(2)
      .pipe(
        takeUntil(this.destroyService),
        startWith(null)
      )
      .subscribe(() => {
        this.nowHour = paddingZero(String(new Date().getHours()));
      })
  }

  private subscribeFormChange() {
    this.form.valueChanges.pipe(
      takeUntil(this.destroyService),
    ).subscribe(() => {
      this.fetchTimerNotifyObservers();
    })
  }

  private fetchTimerNotifyObservers() {
    this.service.queryList({ type: NotifyObserverTypes.TIMER, enableTracking: true })
      .subscribe({
        next: (results) => {
          this.resolveResults(results)
        },
        error: (err) => {
          this.nzNotificationService.error(`获取定时任务失败`, `${err.message}`)
        }
      })
  }

  private resolveResults(results: NotifyObserver[]) {
    const hours = []
    for (let hour = 0; hour < 24; hour += 1) {
      const theItems = results.filter(e => Array.isArray(e.timerHour) && e.timerHour.indexOf(hour) >= 0);
      const filteredItems = theItems.filter(e => this.filterByTaskType(this.form.value.taskType as TaskTypes, e))
      hours.push({
        hour: paddingZero(String(hour)), items: filteredItems.sort((a, b) => {
          const aMin = (Array.isArray(a.timerMinute) && a.timerMinute.length > 0) ? a.timerMinute[0] : 0;
          const bMin = (Array.isArray(b.timerMinute) && b.timerMinute.length > 0) ? b.timerMinute[0] : 0;
          return aMin - bMin
        })
      })
    }

    this.times = [
      hours.slice(0, 6),
      hours.slice(6, 12),
      hours.slice(12, 18),
      hours.slice(18, 24),
    ]
  }

  private filterByTaskType(type: TaskTypes, item: NotifyObserver): boolean {
    switch (type) {
      case TaskTypes.TODAY:
        return this.checkTodayMatched(item.timerDate, item.timerMonth);
      case TaskTypes.TOMORROW:
        return this.checkTomorrowMatched(item.timerDate, item.timerMonth);
      case TaskTypes.THIS_MONTH:
        return this.checkThisMonthMatched(item.timerDate, item.timerMonth);
      case TaskTypes.NOT_TODAY:
        return !(this.checkTodayMatched(item.timerDate, item.timerMonth));
      case TaskTypes.ALL:
        return true;
      default:
        this.nzNotificationService.warning(`未知任务类型`, `${type}`)
        return true
    }
  }

  private checkTodayMatched(timerDate?: number[], timerMonth?: number[]): boolean {
    const date = new Date();
    const theDate = date.getDate();
    const theMonth = date.getMonth() + 1;
    return this.checkTheDayMatched(theDate, theMonth, timerDate, timerMonth);
  }

  private checkTomorrowMatched(timerDate?: number[], timerMonth?: number[]): boolean {
    const tomorrow = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1e3);
    const theDate = tomorrow.getDate();
    const theMonth = tomorrow.getMonth() + 1;
    return this.checkTheDayMatched(theDate, theMonth, timerDate, timerMonth);
  }

  private checkThisMonthMatched(timerDate?: number[], timerMonth?: number[]): boolean {
    const oneDay = 1 * 24 * 60 * 60 * 1e3;
    const afterTomorrow = new Date(new Date().getTime() + 2 * oneDay);

    for (let day = afterTomorrow.getTime(); new Date(day).getMonth() === new Date().getMonth(); day += oneDay) {
      const theDate = new Date(day).getDate();
      const theMonth = new Date(day).getMonth() + 1;
      const matched = this.checkTheDayMatched(theDate, theMonth, timerDate, timerMonth);
      if (matched) {
        return true;
      }
    }

    return false;
  }

  // theDate 一号/1  二号/2 ...
  // theMonth 一月/1  二月/2 ...
  private checkTheDayMatched(theDate: number, theMonth: number, timerDate?: number[], timerMonth?: number[]): boolean {
    return this.checkDate(theDate, timerDate) && this.checkMonth(theMonth, timerMonth)
  }

  private checkDate(theDate: number, date?: number[]): boolean {
    if (date && date.length > 0) {
      return date.indexOf(theDate) >= 0
    }

    return true
  }

  private checkMonth(theMonth: number, month?: number[]): boolean {
    if (month && month.length > 0) {
      return month.indexOf(theMonth) >= 0
    }

    return true
  }
}