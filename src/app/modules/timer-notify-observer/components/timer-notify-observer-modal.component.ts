import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotifyObserver, NotifyObserverService, NotifyObserverTypes } from 'src/app/shared';
import { CreateNotifyObserverService, NotifyObserverModalActions } from 'src/app/modules/create-notify-observer'

@Component({
  selector: 'timer-notify-observer-modal',
  templateUrl: 'timer-notify-observer-modal.component.html'
})

export class TimerNotifyObserverModalComponent implements OnInit {
  constructor(
    private readonly service: NotifyObserverService,
    private readonly notification: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly notifyObserverService: NotifyObserverService,
    private viewContainerRef: ViewContainerRef,
  ) { }

  visible = false;
  nowHour = -1;

  times: Array<Array<{
    hour: number;
    items: Array<NotifyObserver>
  }>> = []

  ngOnInit() {
  }

  open() {
    this.visible = true;
    this.nowHour = new Date().getHours();
    this.fetchTimerNotifyObservers();
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

  private fetchTimerNotifyObservers() {
    this.service.queryList({ type: NotifyObserverTypes.TIMER })
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
      const theItems = results.filter(e => Array.isArray(e.timerHour) && e.timerHour.indexOf(hour) >= 0)
      hours.push({
        hour: hour, items: theItems.sort((a, b) => {
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
}