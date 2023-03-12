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
    this.sharedService.fetchLink3ActivityDetail(item.link)
      .subscribe({
        next: (v) => {
          if (v.code === 0) {
            this.showCreateTimerNotifyObserver(v.result, item.followedProjectID);
          } else {
            this.nzNotificationService.error(`获取Link3活动详情 失败`, `${v.message}`);
            this.showCreateTimerNotifyObserver();
          }
        },
        error: (err) => {
          this.nzNotificationService.error(`获取Link3活动详情 失败`, `${err.message}`);
          this.showCreateTimerNotifyObserver();
        }
      })
  }

  showCreateTimerNotifyObserverGetter(item: TableItem): boolean {
    return item.type === NotifyObserverTypes.LINK3_RECOMMEND || item.type === NotifyObserverTypes.LINK3
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

  private showCreateTimerNotifyObserver(activity?: any, followedProjectID?: string) {
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
      type: NotifyObserverTypes.TIMER,
      timerOnce: true,
      ...(followedProjectID ? { followedProjectID } : {}),

      ...(activity ? {
        notifyShowTitle: `${activity.organizerHandle} - Link3 | ${activity.title}`,
        timerHour: [new Date(activity.startTime).getHours()],
        timerMinute: [new Date(activity.startTime).getMinutes()],
        timerDate: [new Date(activity.startTime).getDate()],
        timerMonth: [new Date(activity.startTime).getMonth() + 1],
        timerNotifyShowDesc: activity.rewardInfo,
        timerNotifyShowUrl: activity.url
      } : {})
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '添加通知源',
      obj,
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`添加定时任务通知源成功`, `添加定时任务通知源成功`);
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加定时任务通知源失败`, `${e.message}`);
    });
  }
}