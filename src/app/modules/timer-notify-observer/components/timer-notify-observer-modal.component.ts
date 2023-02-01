import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotifyObserver, NotifyObserverService, NotifyObserverTypes } from 'src/app/shared';

@Component({
  selector: 'timer-notify-observer-modal',
  templateUrl: 'timer-notify-observer-modal.component.html'
})

export class TimerNotifyObserverModalComponent implements OnInit {
  constructor(
    private readonly service: NotifyObserverService,
    private readonly notification: NzNotificationService
  ) { }

  visible = false;

  times: Array<Array<any>> = []

  ngOnInit() {
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
      hours.push({ hour: hour, items: theItems.map(e => e.notifyShowTitle) })
    }

    this.times = [
      hours.slice(0, 6),
      hours.slice(6, 12),
      hours.slice(12, 18),
      hours.slice(18, 24),
    ]
  }
}