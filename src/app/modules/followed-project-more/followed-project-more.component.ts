import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CreateFollowedProjectTrackingRecordService, FollowedProjectTrackingRecordModalActions } from 'src/app/modules/create-followed-project-tracking-record';
import { CreateNotifyObserverService } from 'src/app/modules/create-notify-observer';
import { FollowedProjectTrackingRecord, FollowedProjectTrackingRecordService, NotifyObserver, NotifyObserverService, TagTypes, } from 'src/app/shared';
import { DestroyService } from 'src/app/shared/services/destroy.service';
import { NotifyObserverTypeManagerService } from 'src/app/modules/create-notify-observer';
import { removeKeys } from 'src/app/utils';

interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

interface TrackingRecordExtend extends FollowedProjectTrackingRecord {
  followedProjectIDCtrl: FormControl;
  tagIDsCtrl: FormControl;
}

@Component({
  selector: 'followed-project-more',
  templateUrl: 'followed-project-more.component.html',
  styleUrls: ['./followed-project-more.component.less'],
  providers: [DestroyService]
})

export class FollowedProjectMoreComponent implements OnInit {
  constructor(
    private readonly notifyObserverService: NotifyObserverService,
    private readonly followedProjectTrackingRecordService: FollowedProjectTrackingRecordService,
    private readonly notificationService: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly notifyObserverTypeService: NotifyObserverTypeManagerService,
    private readonly createFollowedProjectTrackingRecordService: CreateFollowedProjectTrackingRecordService
  ) { }

  @Input() id = '';

  notifyObservers: TableItem[] = [];
  loadingNotifyObservers = false;

  tagType = TagTypes.TRACKING_RECORD_CATEGORY
  trackingRecords: TrackingRecordExtend[] = [];


  ngOnInit() {
    this.fetchNotifyObservers();
    this.fetchTrackingRecords();
  }

  resolveHref(item: NotifyObserver) {
    return this.notifyObserverTypeService.resolveHref(item)
  }

  resolveTitle(item: NotifyObserver) {
    return `${item.notifyShowTitle} | ${this.notifyObserverTypeService.resolveDesc(item)}`
  }

  showCreateNotifyObserverModal() {
    if (!this.id) {
      return;
    }
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
      followedProjectID: this.id
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '添加通知源',
      obj
    );

    success.subscribe((v) => {
      this.notificationService.success(`添加通知源成功`, `添加通知源成功`);
      this.fetchNotifyObservers();
    });
    error.subscribe((e) => {
      this.notificationService.error(`添加通知源失败`, `${e.message}`);
    });
  }
  showCreateTrackingRecordModal() {
    if (!this.id) {
      return;
    }
    const obj: Partial<FollowedProjectTrackingRecord> = {
      followedProjectID: this.id
    };
    const { success, error } = this.createFollowedProjectTrackingRecordService.createModal(
      '添加跟踪记录',
      obj,
    );

    success.subscribe((v) => {
      this.notificationService.success(`添加跟踪记录成功`, `添加跟踪记录成功`);
      this.fetchTrackingRecords();
    });
    error.subscribe((e) => {
      this.notificationService.error(`添加跟踪记录失败`, `${e.message}`);
    });
  }

  confirmCopy(item: FollowedProjectTrackingRecord) {
    const obj: Partial<FollowedProjectTrackingRecord> = {
      ...removeKeys(item, ['_id', 'createdAt', 'createdAtStr']),
    };
    const { success, error } = this.createFollowedProjectTrackingRecordService.createModal(
      '添加跟踪记录',
      obj,
      FollowedProjectTrackingRecordModalActions.CREATE
    );

    success.subscribe((v) => {
      this.notificationService.success(`添加跟踪记录成功`, `添加跟踪记录成功`);
      this.fetchTrackingRecords();
    });
    error.subscribe((e) => {
      this.notificationService.error(`添加跟踪记录失败`, `${e.message}`);
    });
  }


  private fetchNotifyObservers() {
    if (!this.id) {
      return
    }

    this.loadingNotifyObservers = true;
    this.notifyObserverService.queryList({ followedProjectID: this.id })
      .subscribe({
        next: (items: NotifyObserver[]) => {
          this.loadingNotifyObservers = false;
          if (items.length > 0) {
            this.notifyObservers = items.map((e) => ({
              ...e,
              enableTrackingCtrl: new FormControl(!!e.enableTracking),
              ...(e.followedProjectID ? {
                followedProjectIDCtrl: new FormControl(e.followedProjectID)
              } : {})
            }))
          } else {
            this.notifyObservers = [];
            this.notificationService.warning(`没有找到 通知源`, `也许该项目还没有添加通知源`)
          }
        },
        error: (err: Error) => {
          this.loadingNotifyObservers = false;
          this.notificationService.error(`获取 通知源 失败`, `${err.message}`)
        }
      })
  }

  private fetchTrackingRecords() {
    if (!this.id) {
      return
    }

    this.loadingNotifyObservers = true;
    this.followedProjectTrackingRecordService.queryList({ followedProjectID: this.id }, { number: 1, size: 5 })
      .subscribe({
        next: (items: FollowedProjectTrackingRecord[]) => {
          this.loadingNotifyObservers = false;
          if (items.length > 0) {
            this.trackingRecords = items.map((e) => ({
              ...e,
              followedProjectIDCtrl: new FormControl(e.followedProjectID),
              tagIDsCtrl: new FormControl(e.tagIDs),
            }))
          } else {
            this.trackingRecords = [];
            this.notificationService.warning(`没有找到 跟踪记录`, `也许该项目还没有添加跟踪记录`)
          }
        },
        error: (err: Error) => {
          this.loadingNotifyObservers = false;
          this.notificationService.error(`获取 跟踪记录 失败`, `${err.message}`)
        }
      })
  }
}