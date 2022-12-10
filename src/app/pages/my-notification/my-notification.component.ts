import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import {
  CreateNotifyObserverService,
  NotifyObserverModalActions,
} from 'src/app/modules/create-notify-observer';

import {
  NotifyObserver,
  NotifyObserverService,
  NotifyObserverTypes,
} from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';
import { environment } from 'src/environments/environment';

interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
}

@Component({
  selector: 'app-my-notification',
  templateUrl: './my-notification.component.html',
  styleUrls: ['./my-notification.component.less'],
})
export class MyNotificationComponent implements OnInit {
  constructor(
    private readonly notifyObserverService: NotifyObserverService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private viewContainerRef: ViewContainerRef,
    private createNotifyObserverService: CreateNotifyObserverService
  ) { }

  logoBasePath = environment.baseURL

  total = 1;
  items: TableItem[] = [];
  loading = true;
  pageSize = 12;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  types = [
    {
      label: '所有',
      value: '',
    },
  ];
  form = this.fb.group({
    notifyShowTitle: [null],
    type: [this.types[0].value],
    enableTracking: [null],
  });

  subscriptions: Subscription[] = [];

  submitForm(): void {
    this.pageIndex = 1;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      type: this.types[0].value,
    });

    this.pageIndex = 1;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();

    this.notifyObserverService.queryTypes()
      .subscribe(types => {
        this.types = [
          {
            label: '所有',
            value: '',
          },
          ...types
        ]
      })
  }

  resolveHref(item: NotifyObserver) {
    switch (item.type) {
      case NotifyObserverTypes.MEDIUM:
        return item.mediumHomeLink
      case NotifyObserverTypes.MIRROR:
        return item.mirrorHomeLink
      case NotifyObserverTypes.TWITTER:
        return item.twitterHomeLink
      case NotifyObserverTypes.TWITTER_SPACE:
        return item.twitterSpaceHomeLink
      case NotifyObserverTypes.GALXE:
        return item.galxeHomeLink
      case NotifyObserverTypes.QUEST3:
        return item.quest3HomeLink
      case NotifyObserverTypes.TIMER:
        return item.timerNotifyShowUrl
      default:
        console.warn(`resolveHref() unknown type: ${item.type}`)
        return ''
    }
  }

  resolveDesc(item: NotifyObserver) {
    switch (item.type) {
      case NotifyObserverTypes.MEDIUM:
        return item.mediumTitleKey
      case NotifyObserverTypes.MIRROR:
        return item.mirrorTitleKey
      case NotifyObserverTypes.TWITTER:
        return item.twitterTitleKey
      case NotifyObserverTypes.TWITTER_SPACE:
        return item.twitterSpaceTitleKey
      case NotifyObserverTypes.GALXE:
        return item.galxeTitleKey
      case NotifyObserverTypes.QUEST3:
        return item.quest3TitleKey
      case NotifyObserverTypes.TIMER:
        return `${item.timerNotifyShowDesc} ${this.isNumberArray(item.timerMonth) ? `月: ${item.timerMonth?.join(', ')} ` : ''}${this.isNumberArray(item.timerDate) ? ` 日: ${item.timerDate?.join(', ')} ` : ''}时: ${item.timerHour?.join(', ')} 分: ${item.timerMinute?.join(', ')}`
      default:
        console.warn(`resolveDesc() unknown type: ${item.type}`)
        return ''
    }
  }

  private isNumberArray(v?: number[]): boolean {
    return Array.isArray(v) && v.length > 0 && v.every(f => typeof f === 'number')
  }

  showCreateModal() {
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '添加订阅源',
      obj,
      this.viewContainerRef
    );

    success.subscribe((v) => {
      this.notification.success(`添加订阅源成功`, `添加订阅源成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`添加订阅源失败`, `${e.message}`);
    });
  }

  confirmUpdate(item: TableItem) {
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
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`修改订阅源失败`, `${e.message}`);
    });
  }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }

  confirmDelete(item: TableItem) {
    this.notifyObserverService.deleteByID(item._id).subscribe({
      next: () => {
        this.notification.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.notification.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: TableItem) { }

  private loadDataFromServer(): void {
    this.query = removeEmpty(this.form.value);
    this.loading = true;
    this.notifyObserverService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.unsubscribeUpdateEnableTrackingCtrls();
        this.loading = false;
        this.items = results.map((e) => ({
          ...e,
          enableTrackingCtrl: new FormControl(!!e.enableTracking),
        }));

        this.subscribeUpdateEnableTrackingCtrls();
      });

    this.notifyObserverService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private unsubscribeUpdateEnableTrackingCtrls() {
    this.subscriptions.forEach((e) => {
      e.unsubscribe();
    });
    this.subscriptions = [];
  }

  private subscribeUpdateEnableTrackingCtrls() {
    this.items.forEach((e) => {
      const sub = e.enableTrackingCtrl.valueChanges.subscribe((v) => {
        this.notifyObserverService
          .update(e._id, { enableTracking: !!v })
          .subscribe(() => {
            this.loadDataFromServer();
          });
      });

      this.subscriptions.push(sub);
    });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // name website 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'notifyShowTitle') {
        Object.assign(o, {
          ['notifyShowTitle']: {
            $regex: query['notifyShowTitle'],
            $options: 'i',
          },
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }
}
