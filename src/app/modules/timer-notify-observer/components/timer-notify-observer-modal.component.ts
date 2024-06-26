import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotifyObserver, NotifyObserverService, NotifyObserverTypes, SystemTaskTimerSettings, SystemTaskTimerSettingsService, TimerService, genTaskRecordCondition } from 'src/app/shared';
import { CreateNotifyObserverService, NotifyObserverModalActions } from 'src/app/modules/create-notify-observer'
import { CreateSystemTaskTimerSettingsService, SystemTaskTimerSettingsModalActions } from 'src/app/modules/create-system-task-timer-settings'
import { DestroyService } from 'src/app/shared/services/destroy.service';
import { Observable, forkJoin, map, mergeMap, startWith, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { paddingZero, removeEmpty } from 'src/app/utils';

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
    private readonly systemTaskTimerSettingsService: SystemTaskTimerSettingsService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly createSystemTaskTimerSettingsService: CreateSystemTaskTimerSettingsService,
    private readonly notifyObserverService: NotifyObserverService,
    private readonly destroyService: DestroyService,
    private readonly timerService: TimerService,
    private readonly fb: FormBuilder,
  ) { }

  visible = false;
  nowHour = '';
  nowMinute = '';

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
  form: FormGroup<any> = this.fb.group({
    taskType: [
      this.taskTypes[0].value
    ],
    timerEnableScript: [false],
    timerEnableStatistics: [false]
  })

  ngOnInit() {
    this.subscribeNowChange();
    this.subscribeFormChange();
  }

  open() {
    this.visible = true;

    this.fetchTimerNotifyObservers();
  }

  tooltipGetter(hour: string, item: NotifyObserver) {
    return `${hour}:${(item.timerMinute || []).map(e => paddingZero(String(e))).join(',')} / 点击编辑`
  }

  hasExpired(hour: string, item: NotifyObserver): boolean {
    if (Number(hour) < Number(this.nowHour)) {
      return true
    }
    if (Number(hour) === Number(this.nowHour)) {
      return (item.timerMinute || []).every(n => Number(n) <= Number(this.nowMinute))
    }
    return false
  }

  genTaskRecordCondition(item: NotifyObserver) {
    const cond = genTaskRecordCondition(item.type)
    if (item.type === NotifyObserverTypes.TIMER) {
      Object.assign(cond, {
        ['key']: { $regex: item._id, $options: 'i' },
      })
    }
    return cond
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
    if (item.type !== NotifyObserverTypes.TIMER) {
      this.confirmUpdateSystemTaskTimerSettings(item)
    } else {
      this.confirmUpdateTimerNotifyObserver(item)
    }
  }

  private confirmUpdateSystemTaskTimerSettings(item: NotifyObserver) {
    const obj: Partial<SystemTaskTimerSettings> = {
      _id: item._id,
      type: item.type,
      timerHour: item.timerHour,
      timerMinute: item.timerMinute,
      timerDate: item.timerDate,
      timerMonth: item.timerMonth,
      timerDayOfWeek: item.timerDayOfWeek
    };
    const { success, error } = this.createSystemTaskTimerSettingsService.createModal(
      `修改 ${item.type} 定时任务`,
      obj,
      SystemTaskTimerSettingsModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`修改 ${item.type} 定时任务成功`, `修改 ${item.type} 定时任务成功`);
      this.fetchTimerNotifyObservers();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`修改 ${item.type} 定时任务失败`, `${e.message}`);
    });
  }

  private confirmUpdateTimerNotifyObserver(item: NotifyObserver) {
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
    if (item.type !== NotifyObserverTypes.TIMER) {
      this.nzNotificationService.warning(`${item.type} 定时任务不能删除`, `${item.type} 定时任务不能删除`);
      return
    }

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

  private subscribeNowChange() {
    this.timerService.interval(2)
      .pipe(
        takeUntil(this.destroyService),
        startWith(null)
      )
      .subscribe(() => {
        this.nowHour = paddingZero(String(new Date().getHours()));
        this.nowMinute = paddingZero(String(new Date().getMinutes()));
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
    forkJoin(
      this.notifyObserverService.queryList({
        type: NotifyObserverTypes.TIMER,
        enableTracking: true,
        ...(this.resolveFormQuery())
      } as any),
      this.fetchFakeTimerNotifyObservers()
    )
      .subscribe({
        next: ([results1, results2]) => {
          this.resolveResults([...results1, ...results2])
        },
        error: (err) => {
          this.nzNotificationService.error(`获取定时任务失败`, `${err.message}`)
        }
      })
  }

  private fetchFakeTimerNotifyObservers(): Observable<NotifyObserver[]> {
    return this.systemTaskTimerSettingsService.queryList({})
      .pipe(
        mergeMap((timers) => {
          return forkJoin(...timers.map(e => this.notifyObserverService.queryCount({ type: e.type, enableTracking: true })))
            .pipe(
              map((counts) => {
                return timers.map((e, i) => {
                  return {
                    notifyObserver: {
                      _id: e._id,
                      type: e.type,
                      notifyShowTitle: e.type,
                      timerHour: e.timerHour,
                      timerMinute: e.timerMinute,
                      timerDate: e.timerDate,
                      timerMonth: e.timerMonth,
                      timerDayOfWeek: e.timerDayOfWeek
                    } as NotifyObserver,
                    count: counts[i]
                  }
                })
              })
            )
        }),
        map(results => {
          return results.map(e => {
            return {
              _id: e.notifyObserver._id,
              type: e.notifyObserver.type,
              notifyShowTitle: e.notifyObserver.type + ` ( ${e.count} )`,
              timerHour: e.notifyObserver.timerHour,
              timerMinute: e.notifyObserver.timerMinute,
              timerDate: e.notifyObserver.timerDate,
              timerMonth: e.notifyObserver.timerMonth,
              timerDayOfWeek: e.notifyObserver.timerDayOfWeek
            } as NotifyObserver
          })
        })
      )
  }

  private resolveFormQuery() {
    const o: { [key: string]: any } = {};
    if (this.form.value.timerEnableScript === true) {
      Object.assign(o, {
        timerEnableScript: true
      })
    } else if (this.form.value.timerEnableScript === false) {
      Object.assign(o, {
        timerEnableScript: {
          $in: [null, undefined, false]
        }
      })
    } else {
      // noop
    }

    if (this.form.value.timerEnableStatistics === true) {
      Object.assign(o, {
        timerEnableStatistics: true
      })
    } else if (this.form.value.timerEnableStatistics === false) {
      Object.assign(o, {
        timerEnableStatistics: {
          $in: [null, undefined, false]
        }
      })
    } else {
      // noop
    }

    return o;
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
        return this.checkTodayMatched(item.timerDate, item.timerMonth, item.timerDayOfWeek);
      case TaskTypes.TOMORROW:
        return this.checkTomorrowMatched(item.timerDate, item.timerMonth, item.timerDayOfWeek);
      case TaskTypes.THIS_MONTH:
        return this.checkThisMonthMatched(item.timerDate, item.timerMonth, item.timerDayOfWeek);
      case TaskTypes.NOT_TODAY:
        return !(this.checkTodayMatched(item.timerDate, item.timerMonth, item.timerDayOfWeek));
      case TaskTypes.ALL:
        return true;
      default:
        this.nzNotificationService.warning(`未知任务类型`, `${type}`)
        return true
    }
  }

  private checkTodayMatched(timerDate?: number[], timerMonth?: number[], timerDayOfWeek?: number[]): boolean {
    const date = new Date();
    const theDate = date.getDate();
    const theMonth = date.getMonth() + 1;
    const theDayOfWeek = date.getDay();
    return this.checkTheDayMatched(theDate, theMonth, theDayOfWeek, timerDate, timerMonth, timerDayOfWeek);
  }

  private checkTomorrowMatched(timerDate?: number[], timerMonth?: number[], timerDayOfWeek?: number[]): boolean {
    const tomorrow = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1e3);
    const theDate = tomorrow.getDate();
    const theMonth = tomorrow.getMonth() + 1;
    const theDayOfWeek = tomorrow.getDay();
    return this.checkTheDayMatched(theDate, theMonth, theDayOfWeek, timerDate, timerMonth, timerDayOfWeek);
  }

  private checkThisMonthMatched(timerDate?: number[], timerMonth?: number[], timerDayOfWeek?: number[]): boolean {
    const oneDay = 1 * 24 * 60 * 60 * 1e3;
    const afterTomorrow = new Date(new Date().getTime() + 2 * oneDay);

    for (let day = afterTomorrow.getTime(); new Date(day).getMonth() === new Date().getMonth(); day += oneDay) {
      const theDate = new Date(day).getDate();
      const theMonth = new Date(day).getMonth() + 1;
      const theDayOfWeek = new Date(day).getDay();
      const matched = this.checkTheDayMatched(theDate, theMonth, theDayOfWeek, timerDate, timerMonth, timerDayOfWeek);
      if (matched) {
        return true;
      }
    }

    return false;
  }

  // theDate 一号/1  二号/2 ...
  // theMonth 一月/1  二月/2 ...
  // theDayOfWeek 周日/0 周一/1 周二/2
  private checkTheDayMatched(theDate: number, theMonth: number, theDayOfWeek: number, timerDate?: number[], timerMonth?: number[], timerDayOfWeek?: number[]): boolean {
    return this.checkDate(theDate, timerDate) && this.checkMonth(theMonth, timerMonth) && this.checkDayOfWeek(theDayOfWeek, timerDayOfWeek)
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

  private checkDayOfWeek(theDayOfWeek: number, dayOfWeek?: number[]): boolean {
    if (dayOfWeek && dayOfWeek.length > 0) {
      return dayOfWeek.indexOf(theDayOfWeek) >= 0
    }

    return true
  }
}