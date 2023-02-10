import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CreateFollowedProjectService, FollowedProjectModalActions } from 'src/app/modules/create-followed-project';
import { CreateFollowedProjectTrackingRecordService } from 'src/app/modules/create-followed-project-tracking-record';
import { CreateNotifyObserverService, NotifyObserverModalActions } from 'src/app/modules/create-notify-observer';
import { ClientNotifyService, FollowedProject, FollowedProjectService, FollowedProjectTrackingRecord, NotifyObserver, NotifyObserverService, } from 'src/app/shared';
import { DestroyService } from 'src/app/shared/services/destroy.service';

interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'followed-project-more',
  templateUrl: 'followed-project-more.component.html',
  styleUrls: ['./followed-project-more.component.less'],
  providers: [DestroyService]
})

export class FollowedProjectMoreComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly followedProjectService: FollowedProjectService,
    private readonly notifyObserverService: NotifyObserverService,
    private readonly notificationService: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly destroy$: DestroyService,
    private readonly clientNotifyService: ClientNotifyService,
    private createFollowedProjectTrackingRecordService: CreateFollowedProjectTrackingRecordService
  ) { }

  @Input() id = '';
  @Input() viewContainerRef: ViewContainerRef | null = null;


  notifyObservers: TableItem[] = [];
  loadingNotifyObservers = false;


  ngOnInit() {
    this.fetchNotifyObservers();
  }



  showCreateNotifyObserverModal() {
    if (!this.id || !this.viewContainerRef) {
      return;
    }
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
      followedProjectID: this.id
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '添加通知源',
      obj,
      this.viewContainerRef
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
    if (!this.id || !this.viewContainerRef) {
      return;
    }
    const obj: Partial<FollowedProjectTrackingRecord> = {
      followedProjectID: this.id
    };
    const { success, error } = this.createFollowedProjectTrackingRecordService.createModal(
      '添加跟踪记录',
      obj,
      this.viewContainerRef
    );

    success.subscribe((v) => {
      this.notificationService.success(`添加跟踪记录成功`, `添加跟踪记录成功`);
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
}