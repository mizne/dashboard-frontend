import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NotifyHistory, NotifyObserverTypes } from '../../models';
import { removeEmpty } from 'src/app/utils';
import { ClientNotifyService, NotifyHistoryService } from '../../services';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DestroyService } from '../../services/destroy.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'notify-history',
  templateUrl: 'notify-history.component.html',
  providers: [DestroyService],
})
export class NotifyHistoryComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly destroy$: DestroyService,
    private readonly notifyHistoryService: NotifyHistoryService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly clientNotifyService: ClientNotifyService
  ) { }

  visible = false;
  unReadCount = 0;

  loading = false;
  items: NotifyHistory[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;

  query: { [key: string]: any } = {};
  types = [
    {
      label: '所有',
      value: '',
    },
    {
      label: 'Medium',
      value: NotifyObserverTypes.MEDIUM,
    },
    {
      label: 'Mirror',
      value: NotifyObserverTypes.MIRROR,
    },
    {
      label: 'Twitter',
      value: NotifyObserverTypes.TWITTER,
    },
    {
      label: 'Twitter Space',
      value: NotifyObserverTypes.TWITTER_SPACE,
    },
    {
      label: 'Quest3',
      value: NotifyObserverTypes.QUEST3,
    },
    {
      label: 'BNB Chain BLOG',
      value: NotifyObserverTypes.BNBCHAIN_BLOG,
    },
    {
      label: 'Binance Blog',
      value: NotifyObserverTypes.BINANCE_BLOG,
    },
    {
      label: 'Link3',
      value: NotifyObserverTypes.LINK3,
    },
    {
      label: 'Galxe',
      value: NotifyObserverTypes.GALXE,
    },
    {
      label: 'CWallet',
      value: NotifyObserverTypes.CWALLET,
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
    this.clientNotifyService
      .listenNotifyObserver()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.unReadCount += 1;
      });
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

  open(): void {
    this.visible = true;
    this.unReadCount = 0;
    this.loadDataFromServer();
  }

  close(): void {
    this.visible = false;
  }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
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
        this.items = results;
      });

    this.notifyHistoryService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.totalCount = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // title desc 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'title') {
        Object.assign(o, {
          ['title']: { $regex: query['title'], $options: 'i' },
        });
      } else if (key === 'desc') {
        Object.assign(o, {
          ['desc']: { $regex: query['desc'], $options: 'i' },
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
