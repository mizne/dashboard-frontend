import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotifyObserver, NotifyObserverService, NotifyObserverTypes, TimerService } from 'src/app/shared';
import { CreateNotifyObserverService, NotifyObserverModalActions } from 'src/app/modules/create-notify-observer'
import { DestroyService } from 'src/app/shared/services/destroy.service';
import { startWith, takeUntil } from 'rxjs';
import { FormBuilder } from '@angular/forms';

enum TaskTypes {
  TODAY = 'today',
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
    private readonly notification: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly notifyObserverService: NotifyObserverService,
    private readonly destroyService: DestroyService,
    private readonly timerService: TimerService,
    private readonly fb: FormBuilder,
    private viewContainerRef: ViewContainerRef,
  ) { }

  visible = false;
  nowHour = -1;

  times: Array<Array<{
    hour: number;
    items: Array<NotifyObserver>
  }>> = []

  taskTypes = [
    {
      label: '今天',
      value: TaskTypes.TODAY
    },
    {
      label: '非今天',
      value: TaskTypes.NOT_TODAY
    },
    {
      label: '所有',
      value: TaskTypes.ALL
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

  confirmCreate() {
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
      type: NotifyObserverTypes.TIMER
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '新增订阅源',
      obj,
      this.viewContainerRef
    );

    success.subscribe((v) => {
      this.notification.success(`新增订阅源成功`, `新增订阅源成功`);
      this.fetchTimerNotifyObservers();
    });
    error.subscribe((e) => {
      this.notification.error(`新增订阅源失败`, `${e.message}`);
    });
  }

  confirmUpdate(item: NotifyObserver) {
    const obj: Partial<NotifyObserver> = {
      ...item,
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '修改订阅源',
      obj,
      this.viewContainerRef,
      NotifyObserverModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notification.success(`修改订阅源成功`, `修改订阅源成功`);
      this.fetchTimerNotifyObservers();
    });
    error.subscribe((e) => {
      this.notification.error(`修改订阅源失败`, `${e.message}`);
    });
  }

  confirmDelete(item: NotifyObserver) {
    this.notifyObserverService.deleteByID(item._id).subscribe({
      next: () => {
        this.notification.success(`删除成功`, `删除数据成功`);
        this.fetchTimerNotifyObservers();
      },
      complete: () => { },
      error: (e) => {
        this.notification.error(`删除失败`, `请稍后重试，${e.message}`);
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
        this.nowHour = new Date().getHours();
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
          this.notification.error(`获取定时任务失败`, `${err.message}`)
        }
      })
  }

  private resolveResults(results: NotifyObserver[]) {
    const hours = []
    for (let hour = 0; hour < 24; hour += 1) {
      const theItems = results.filter(e => Array.isArray(e.timerHour) && e.timerHour.indexOf(hour) >= 0);
      const filteredItems = theItems.filter(e => this.filterByTaskType(this.form.value.taskType as TaskTypes, e))
      hours.push({
        hour: hour, items: filteredItems.sort((a, b) => {
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
        return this.checkDate(item.timerDate) && this.checkMonth(item.timerMonth);
      case TaskTypes.NOT_TODAY:
        return !(this.checkDate(item.timerDate) && this.checkMonth(item.timerMonth));
      case TaskTypes.ALL:
        return true;
      default:
        this.notification.warning(`未知任务类型`, `${type}`)
        return true
    }
  }

  private checkDate(date?: number[]): boolean {
    if (date && date.length > 0) {
      return date.indexOf(new Date().getDate()) >= 0
    }

    return true
  }

  private checkMonth(month?: number[]): boolean {
    if (month && month.length > 0) {
      return month.indexOf(new Date().getMonth() + 1) >= 0
    }

    return true
  }
}