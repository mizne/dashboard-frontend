import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NotifyHistory, NotifyHistoryService, NotifyObserver, NotifyObserverNotAllow, NotifyObserverTypes, SharedService } from 'src/app/shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CreateNotifyObserverNotAllowService } from 'src/app/modules/create-notify-observer-not-allow';
import { CreateNotifyObserverService } from 'src/app/modules/create-notify-observer';

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
    private readonly sharedService: SharedService,
    private readonly notifyHistoryService: NotifyHistoryService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly createNotifyObserverNotAllowService: CreateNotifyObserverNotAllowService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
  ) { }

  @Input() item: TableItem | null = null;

  @Output() markReadSuccess = new EventEmitter<void>();
  @Output() deleteSuccess = new EventEmitter<void>();

  ngOnInit() { }

  createNotAllow(item: TableItem) {
    if (!this.showCreateNotAllowGetter(item)) {
      this.nzNotificationService.warning(`添加黑名单通知源 失败`, `不支持该类型 ${item.type}`);
      return
    }
    const obj: Partial<NotifyObserverNotAllow> = {
      type: item.type === NotifyObserverTypes.GALXE_RECOMMEND ? NotifyObserverTypes.GALXE : NotifyObserverTypes.QUEST3
    };
    const { success, error } = this.createNotifyObserverNotAllowService.createModal(
      '添加黑名单通知源',
      obj,
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(
        `添加黑名单通知源 成功`,
        `添加黑名单通知源 成功`
      );
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加黑名单通知源 失败`, `${e.message}`);
    });
  }

  showCreateNotAllowGetter(item: TableItem): boolean {
    return item.type === NotifyObserverTypes.GALXE_RECOMMEND || item.type === NotifyObserverTypes.QUEST3_RECOMMEND
  }

  createTimerNotifyObserver(item: TableItem) {
    if (item.link) {
      const { success, error } = this.createNotifyObserverService.createLink3ActivityModal(item.link, item.followedProjectID)
      success.subscribe((v) => {
      });
      error.subscribe((e) => {
      });
    }
  }

  showCreateTimerNotifyObserverGetter(item: TableItem): boolean {
    return (item.type === NotifyObserverTypes.LINK3_RECOMMEND || item.type === NotifyObserverTypes.LINK3) && !!item.link && item.link?.indexOf('link3.to/e/') >= 0
  }

  cancelDelete(item: NotifyHistory) { }

  confirmDelete(item: NotifyHistory) {
    this.notifyHistoryService
      .deleteByID(item._id)
      .subscribe({
        next: () => {
          this.deleteSuccess.emit();
        },
        complete: () => { },
        error: (e: Error) => {
          this.nzNotificationService.error(`删除失败`, e.message);
        },
      });
  }

  markRead(item: NotifyHistory) {
    this.notifyHistoryService
      .update(item._id, {
        hasRead: true,
      })
      .subscribe({
        next: () => {
          this.markReadSuccess.emit();
        },
        complete: () => { },
        error: (e: Error) => {
          this.nzNotificationService.error(`标记已读失败`, e.message);
        },
      });
  }
}