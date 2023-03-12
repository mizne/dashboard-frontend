import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NotifyHistory, NotifyObserverTypes } from 'src/app/shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';

interface TableItem extends NotifyHistory {
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'notify-history-item',
  templateUrl: 'notify-history-item.component.html'
})

export class NotifyHistoryItemComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly nzNotificationService: NzNotificationService,
  ) { }

  @Input() item: TableItem | null = null;

  @Output() ensureCreateNotAllow = new EventEmitter<void>();
  @Output() ensureCreateTimerNotifyObserver = new EventEmitter<void>();
  @Output() ensureMarkRead = new EventEmitter<void>();

  ngOnInit() { }

  createNotAllow(item: TableItem) {
    if (!this.showCreateNotAllowGetter(item)) {
      this.nzNotificationService.warning(`添加黑名单通知源 失败`, `不支持该类型 ${item.type}`);
      return
    }
    this.ensureCreateNotAllow.emit();
  }

  showCreateNotAllowGetter(item: TableItem): boolean {
    return item.type === NotifyObserverTypes.GALXE_RECOMMEND || item.type === NotifyObserverTypes.QUEST3_RECOMMEND
  }

  createTimerNotifyObserver(item: TableItem) {
    this.ensureCreateTimerNotifyObserver.emit();
  }

  showCreateTimerNotifyObserverGetter(item: TableItem): boolean {
    return item.type === NotifyObserverTypes.LINK3_RECOMMEND || item.type === NotifyObserverTypes.LINK3
  }

  markRead(item: NotifyHistory) {
    this.ensureMarkRead.emit();
  }
}