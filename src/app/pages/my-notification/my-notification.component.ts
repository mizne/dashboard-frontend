import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import {
  CreateNotifyObserverService,
  NotifyObserverModalActions,
} from 'src/app/modules/create-notify-observer';

import {
  NotifyObserver,
  NotifyObserverService,
  SharedService,
} from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';

interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'app-my-notification',
  templateUrl: './my-notification.component.html',
  styleUrls: ['./my-notification.component.less'],
})
export class MyNotificationComponent implements OnInit {
  constructor(
    private readonly notifyObserverService: NotifyObserverService,
    private readonly nzNotificationService: NzNotificationService,
    private message: NzMessageService,
    private readonly fb: FormBuilder,
    private sharedService: SharedService,
    private createNotifyObserverService: CreateNotifyObserverService
  ) { }

  total = 0;
  items: TableItem[] = [];
  loading = true;
  pageSize = 12;
  pageIndex = 1;
  sort: any = {
    createdAt: -1,
  };

  types = [
    {
      label: '所有',
      value: '',
    },
  ];
  form: FormGroup<any> = this.fb.group({
    notifyShowTitle: [null],
    type: [this.types[0].value],
    enableTracking: [null],
    enableTelegram: [null],
    followedProjectID: [null],
    enableScript: [null],
    enableStatistics: [null],
    scriptText: [null],
  });

  subscriptions: Subscription[] = [];

  link3ActivityInputModalVisible = false;
  link3ActivityInputCtrl = new FormControl(null);


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

  showCreateModal() {
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '添加通知源',
      obj,
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`添加通知源成功`, `添加通知源成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加通知源失败`, `${e.message}`);
    });
  }

  showCreateLink3ActivityModal() {
    this.link3ActivityInputModalVisible = true;
  }

  ensureLink3ActivityInput() {
    if (!this.link3ActivityInputCtrl.value) {
      this.nzNotificationService.warning(`还没有填写Link3活动链接`, `还没有填写Link3活动链接`);
      return
    }

    const { success, error } = this.createNotifyObserverService.createLink3ActivityModal(this.link3ActivityInputCtrl.value)
    success.subscribe((v) => {
      this.link3ActivityInputModalVisible = false;
      this.link3ActivityInputCtrl.patchValue(null);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
    });
  }

  cancelLink3ActivityInput() {
    this.link3ActivityInputModalVisible = false;
    this.link3ActivityInputCtrl.patchValue(null);
  }

  confirmCopy(item: TableItem) {
    const obj: Partial<NotifyObserver> = {
      ...item,
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '复制通知源',
      obj,
      NotifyObserverModalActions.CREATE
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`复制通知源成功`, `复制通知源成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`复制通知源失败`, `${e.message}`);
    });
  }

  confirmUpdate(item: TableItem) {
    const obj: Partial<NotifyObserver> = {
      ...item,
    };
    const { success, error } = this.createNotifyObserverService.createModal(
      '修改通知源',
      obj,
      NotifyObserverModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`修改通知源成功`, `修改通知源成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`修改通知源失败`, `${e.message}`);
    });
  }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }

  confirmDelete(item: TableItem) {
    this.notifyObserverService.deleteByID(item._id).subscribe({
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

  toSearchByNotifyObserver(item: TableItem) {
    this.form.patchValue({ followedProjectID: item.followedProjectID });
    this.submitForm();
  }

  private loadDataFromServer(): void {
    const query = removeEmpty(this.form.value);
    this.loading = true;
    this.notifyObserverService
      .queryList(
        this.adjustQuery(query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe({
        next: (results) => {
          this.unsubscribeUpdateEnableTrackingCtrls();
          this.loading = false;
          this.items = results.map((e) => ({
            ...e,
            enableTrackingCtrl: new FormControl(!!e.enableTracking),
            ...(e.followedProjectID ? {
              followedProjectIDCtrl: new FormControl(e.followedProjectID)
            } : {})
          }));

          this.subscribeUpdateEnableTrackingCtrls();
        }
      });

    this.notifyObserverService
      .queryCount(this.adjustQuery(query))
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
    // 支持正则查询
    const o: { [key: string]: any } = {
      $and: []
    };
    Object.keys(query).forEach((key) => {
      if (key === 'notifyShowTitle') {
        o['$and'].push({
          ['notifyShowTitle']: {
            $regex: query['notifyShowTitle'].trim(),
            $options: 'i',
          },
        })
      } else if (key === 'scriptText') {
        o['$and'].push({
          ['$or']: [
            { blogScript: { $regex: query['scriptText'].trim(), $options: 'i' } },
            { timerScript: { $regex: query['scriptText'].trim(), $options: 'i' } },
            { hookScript: { $regex: query['scriptText'].trim(), $options: 'i' } },
          ],
        })
      } else if (key === 'enableScript') {
        o['$and'].push({
          ['$or']: [
            ...(!!query['enableScript'] ? [
              {
                timerEnableScript: true,
              },
              {
                hookEnableScript: true,
              }
            ] : [
              {
                timerEnableScript: { $in: [false, null, undefined] },
                hookEnableScript: { $in: [false, null, undefined] },
              }
            ])
          ],
        })
      } else if (key === 'enableStatistics') {
        o['$and'].push({
          ['$or']: [
            ...(!!query['enableStatistics'] ? [
              {
                timerEnableStatistics: true,
              },
              {
                hookEnableStatistics: true,
              }
            ] : [
              {
                timerEnableStatistics: { $in: [false, null, undefined] },
                hookEnableStatistics: { $in: [false, null, undefined] },
              }
            ])
          ],
        })
      } else if (key === 'enableTelegram') {
        o['$and'].push({
          ['enableTelegram']: query['enableTelegram'] ? true : { $in: [false, null, undefined] }
        })
      } else {
        o['$and'].push({ [key]: query[key] })
      }
    });

    if (o['$and'].length === 0) {
      return {}
    }
    return o;
  }
}
