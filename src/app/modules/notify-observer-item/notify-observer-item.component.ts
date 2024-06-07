import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NotifyHistory, NotifyHistoryService, NotifyObserver, NotifyObserverService, NotifyObserverTypes, genTaskRecordCondition } from 'src/app/shared';
import { NotifyObserverTypeManagerService } from 'src/app/modules/create-notify-observer';
import { removeEmpty } from 'src/app/utils';
import { NzNotificationService } from 'ng-zorro-antd/notification';


interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

interface NotifyHistoryTableItem extends NotifyHistory {
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'notify-observer-item',
  templateUrl: 'notify-observer-item.component.html'
})

export class NotifyObserverItemComponent implements OnInit {
  constructor(
    private readonly notifyObserverTypeService: NotifyObserverTypeManagerService,
    private readonly notifyHistoryService: NotifyHistoryService,
    private readonly fb: FormBuilder,
    private readonly nzNotificationService: NzNotificationService,
    private readonly notifyObserverService: NotifyObserverService,
  ) { }

  @Input() mode: 'small' | 'default' = 'default'

  @Input() width = 320;
  @Input() item: TableItem | null = null;

  @Input() enableCopy = true;
  @Input() enableEdit = true;
  @Input() enableDelete = true;

  @Output() copy = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() search = new EventEmitter<void>();

  showStatisticsModal = false;

  ngOnInit() { }

  resolveHref(item: TableItem) {
    return this.notifyObserverTypeService.resolveHref(item)
  }

  resolveDesc(item: TableItem) {
    return this.notifyObserverTypeService.resolveDesc(item)
  }

  genTaskRecordCondition(item: TableItem): any {
    const cond = genTaskRecordCondition(item.type)
    if (item.type === NotifyObserverTypes.TIMER) {
      Object.assign(cond, {
        ['key']: { $regex: item._id, $options: 'i' },
      })
    }
    return cond
  }

  confirmCopy() {
    this.copy.emit();
  }

  confirmUpdate() {
    this.update.emit();
  }

  confirmDelete() {
    this.delete.emit();
  }

  confirmTimerExecute() {
    if (!this.item) {
      return
    }

    this.notifyObserverService.timerExecute(this.item._id).subscribe({
      next: () => {
        this.nzNotificationService.success(`启动定时任务成功`, `启动定时任务成功`);
      },
      complete: () => { },
      error: (e) => {
        this.nzNotificationService.error(`启动定时任务失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  toSearch() {
    this.search.emit();
  }




  toShowStatistics() {
    if (this.item?.timerStatisticsDefinitions && this.item.timerStatisticsDefinitions.length > 0) {
      this.showStatisticsModal = true;
    } else {
      this.nzNotificationService.warning(`还没有统计表定义`, `还没有统计表定义`)
    }
  }
}