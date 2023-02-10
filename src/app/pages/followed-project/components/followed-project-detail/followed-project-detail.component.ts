import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CreateFollowedProjectService, FollowedProjectModalActions } from 'src/app/modules/create-followed-project';
import { CreateNotifyObserverService, NotifyObserverModalActions } from 'src/app/modules/create-notify-observer';
import { ClientNotifyService, FollowedProject, FollowedProjectService, NotifyObserver, NotifyObserverService, } from 'src/app/shared';
import { DestroyService } from 'src/app/shared/services/destroy.service';

interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

interface Detail extends FollowedProject {
  tagIDsCtrl: FormControl
}

@Component({
  selector: 'followed-project-detail',
  templateUrl: 'followed-project-detail.component.html',
  styleUrls: ['./followed-project-detail.component.less'],
  providers: [DestroyService]
})

export class FollowedProjectDetailComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private viewContainerRef: ViewContainerRef,
    private readonly followedProjectService: FollowedProjectService,
    private readonly notifyObserverService: NotifyObserverService,
    private readonly notificationService: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly destroy$: DestroyService,
    private readonly clientNotifyService: ClientNotifyService,
    private createFollowedProjectService: CreateFollowedProjectService
  ) { }

  followedProjectID = this.route.snapshot.params['id'];
  followedProjectDetail: Detail | null = null;
  loadingFollowedProject = false;


  notifyObservers: TableItem[] = [];
  loadingNotifyObservers = false;
  subscriptions: Subscription[] = [];

  refreshNotifyHistorySub = new Subject<void>()
  refreshNotifyHistoryObs = this.refreshNotifyHistorySub.asObservable();

  ngOnInit() {
    this.fetchFollowedProjectDetail();
    this.fetchNotifyObservers();

    this.markReadFollowedProject();

    this.subscribeNotifyHistoryChange();
  }

  confirmUpdateFollowedProject() {
    if (!this.followedProjectID || !this.followedProjectDetail) {
      return;
    }

    const obj: Partial<FollowedProject> = {
      ...this.followedProjectDetail,
    };
    const { success, error } = this.createFollowedProjectService.createModal(
      '修改关注项目',
      obj,
      this.viewContainerRef,
      FollowedProjectModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notificationService.success(`修改关注项目成功`, `修改关注项目成功`);
      this.fetchFollowedProjectDetail();
    });
    error.subscribe((e) => {
      this.notificationService.error(`修改关注项目失败`, `${e.message}`);
    });
  }

  showCreateNotifyObserverModal() {
    if (!this.followedProjectID) {
      return;
    }
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
      followedProjectID: this.followedProjectID
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

  confirmUpdate(item: TableItem) {
    const obj: Partial<NotifyObserver> = {
      ...item,
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '修改通知源',
      obj,
      this.viewContainerRef,
      NotifyObserverModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notificationService.success(`修改通知源成功`, `修改通知源成功`);
      this.fetchNotifyObservers();
    });
    error.subscribe((e) => {
      this.notificationService.error(`修改通知源失败`, `${e.message}`);
    });
  }

  confirmDelete(item: TableItem) {
    this.notifyObserverService.deleteByID(item._id).subscribe({
      next: () => {
        this.notificationService.success(`删除成功`, `删除数据成功`);
        this.fetchNotifyObservers();
      },
      complete: () => { },
      error: (e) => {
        this.notificationService.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  private fetchFollowedProjectDetail() {
    if (!this.followedProjectID) {
      return
    }
    this.loadingFollowedProject = true;
    this.followedProjectService.queryList({ _id: this.followedProjectID })
      .subscribe({
        next: (items: FollowedProject[]) => {
          this.loadingFollowedProject = false;
          if (items.length > 0) {
            this.followedProjectDetail = {
              ...items[0],
              tagIDsCtrl: new FormControl(items[0].tagIDs)
            }
          } else {
            this.notificationService.warning(`没有找到 关注项目详情`, `也许已经被删除`)
          }
        },
        error: (err: Error) => {
          this.loadingFollowedProject = false;
          this.notificationService.error(`获取 关注项目详情 失败`, `${err.message}`)
        }
      })
  }

  private markReadFollowedProject() {
    if (!this.followedProjectID) {
      return
    }

    this.followedProjectService.update(this.followedProjectID, {
      hasNews: false
    }).subscribe()
  }

  private fetchNotifyObservers() {
    if (!this.followedProjectID) {
      return
    }

    this.loadingNotifyObservers = true;
    this.notifyObserverService.queryList({ followedProjectID: this.followedProjectID })
      .subscribe({
        next: (items: NotifyObserver[]) => {
          this.loadingNotifyObservers = false;
          if (items.length > 0) {
            this.unsubscribeUpdateEnableTrackingCtrls();
            this.notifyObservers = items.map((e) => ({
              ...e,
              enableTrackingCtrl: new FormControl(!!e.enableTracking),
              ...(e.followedProjectID ? {
                followedProjectIDCtrl: new FormControl(e.followedProjectID)
              } : {})
            }))
            this.subscribeUpdateEnableTrackingCtrls();
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

  private unsubscribeUpdateEnableTrackingCtrls() {
    this.subscriptions.forEach((e) => {
      e.unsubscribe();
    });
    this.subscriptions = [];
  }

  private subscribeUpdateEnableTrackingCtrls() {
    this.notifyObservers.forEach((e) => {
      const sub = e.enableTrackingCtrl.valueChanges.subscribe((v) => {
        this.notifyObserverService
          .update(e._id, { enableTracking: !!v })
          .subscribe(() => {
            this.fetchNotifyObservers();
          });
      });

      this.subscriptions.push(sub);
    });
  }


  private subscribeNotifyHistoryChange() {
    this.clientNotifyService
      .listenNotifyObserver()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshNotifyHistorySub.next();
      });
  }
}