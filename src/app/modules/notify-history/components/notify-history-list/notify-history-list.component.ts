import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { removeEmpty } from 'src/app/utils';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, Observable } from 'rxjs';
import { DestroyService } from 'src/app/shared/services/destroy.service';
import { ClientNotifyService, NotifyHistory, NotifyHistoryService, NotifyObserver, NotifyObserverNotAllow, NotifyObserverTypes, SharedService } from 'src/app/shared';
import { CreateNotifyObserverNotAllowService } from 'src/app/modules/create-notify-observer-not-allow';
import { CreateNotifyObserverService } from 'src/app/modules/create-notify-observer';

interface TableItem extends NotifyHistory {
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'notify-history-list',
  templateUrl: 'notify-history-list.component.html',
  providers: [DestroyService],
})
export class NotifyHistoryListComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly destroy$: DestroyService,
    private readonly notifyHistoryService: NotifyHistoryService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly clientNotifyService: ClientNotifyService,
    private viewContainerRef: ViewContainerRef,
    private readonly createNotifyObserverNotAllowService: CreateNotifyObserverNotAllowService,
    private sharedService: SharedService,
    private createNotifyObserverService: CreateNotifyObserverService,
  ) { }

  @Input() condition: any = null
  @Input() refreshObs: Observable<void> = EMPTY

  loading = false;
  items: TableItem[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;

  query: { [key: string]: any } = {};
  types = [
    {
      label: '所有',
      value: '',
    },
  ];
  readStatuses = [
    {
      label: '未读',
      value: false,
    },
    {
      label: '已读',
      value: true,
    },
    {
      label: '所有',
      value: '',
    },
  ];
  form = this.fb.group({
    title: [null],
    desc: [null],
    type: [this.types[0].value],
    hasRead: [this.readStatuses[0].value],
  });

  ngOnInit() {
    this.loadDataFromServer();

    this.refreshObs.subscribe(() => {
      this.loadDataFromServer();
    })

    this.notifyHistoryService.queryTypes()
      .subscribe((types) => {
        this.types = [
          {
            label: '所有',
            value: '',
          },
          ...types
        ]
      })
  }

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
      this.viewContainerRef
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
            this.showCreateTimerNotifyObserver(v.result);
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
    return item.type === NotifyObserverTypes.LINK3_RECOMMEND
  }

  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      type: this.types[0].value,
      hasRead: this.readStatuses[0].value,
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  markRead(item: NotifyHistory) {
    this.notifyHistoryService
      .update(item._id, {
        hasRead: true,
      })
      .subscribe({
        next: () => {
          this.loadDataFromServer();
        },
        complete: () => { },
        error: (e: Error) => {
          this.nzNotificationService.error(`标记已读失败`, e.message);
        },
      });
  }

  confirmDelete(item: NotifyHistory) {
    this.notifyHistoryService.deleteByID(item._id).subscribe({
      next: () => {
        this.nzNotificationService.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.nzNotificationService.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: NotifyHistory) { }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }

  private showCreateTimerNotifyObserver(activity?: any) {
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
      type: NotifyObserverTypes.TIMER,
      timerOnce: true,

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
      this.viewContainerRef
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`添加定时任务通知源成功`, `添加定时任务通知源成功`);
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加定时任务通知源失败`, `${e.message}`);
    });
  }

  private loadDataFromServer() {
    this.query = removeEmpty(this.form.value);
    this.loading = true;
    this.notifyHistoryService
      .queryList(this.adjustQuery(this.query), {
        number: this.pageIndex,
        size: this.pageSize,
      })
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map(e => ({
          ...e,
          ...(e.followedProjectID ? {
            followedProjectIDCtrl: new FormControl(e.followedProjectID)
          } : {})
        }));
      });

    this.notifyHistoryService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.totalCount = count;
      });
  }
  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // title desc 支持正则查询
    const o: { [key: string]: any } = {
      ...this.condition
    };
    Object.keys(query).forEach((key) => {
      if (key === 'title') {
        Object.assign(o, {
          ['title']: { $regex: query['title'].trim(), $options: 'i' },
        });
      } else if (key === 'desc') {
        Object.assign(o, {
          ['desc']: { $regex: query['desc'].trim(), $options: 'i' },
        });
      } else if (key === 'hasRead' && query['hasRead'] === false) {
        Object.assign(o, {
          ['hasRead']: { $in: [false, undefined, null] },
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }
}
