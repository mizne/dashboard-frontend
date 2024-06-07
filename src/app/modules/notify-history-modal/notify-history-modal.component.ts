import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotifyHistory, NotifyHistoryService } from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';

interface NotifyHistoryTableItem extends NotifyHistory {
  followedProjectIDCtrl?: FormControl;
}
@Component({
  selector: 'notify-history-modal',
  templateUrl: 'notify-history-modal.component.html'
})
export class NotifyHistoryModalComponent implements OnInit {
  constructor(
    private readonly notifyHistoryService: NotifyHistoryService,
    private readonly fb: FormBuilder,
    private readonly nzNotificationService: NzNotificationService,
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  @Input() title = '通知历史'
  @Input() condition: { [key: string]: any } = {}

  showModal = false;
  loading = false;
  items: NotifyHistoryTableItem[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 6;

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
    hasRead: [this.readStatuses[2].value],
  });

  ngOnInit() {
  }

  open() {
    this.showModal = true;
    this.loadNotifyHistory();
  }

  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 6;
    this.loadNotifyHistory();
  }

  resetForm() {
    this.form.reset({
      hasRead: this.readStatuses[2].value,
    });
    this.pageIndex = 1;
    this.pageSize = 6;
    this.loadNotifyHistory();
  }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadNotifyHistory();
  }

  reloadNotifyHistoryItems(item: NotifyHistoryTableItem) {
    this.loadNotifyHistory();
  }

  trackByID(index: number, item: NotifyHistoryTableItem) {
    return item._id;
  }

  batchMarkRead() {
    this.loading = true;
    this.notifyHistoryService.batchMarkRead(this.items.map(e => e._id))
      .subscribe({
        next: () => {
          this.loading = false;
          this.loadNotifyHistory();
        },
        error: (err) => {
          this.loading = false;
          this.nzNotificationService.error(`批量标记已读失败`, `${err.message}`)
        }
      })
  }

  private loadNotifyHistory() {
    this.loading = true;
    this.notifyHistoryService
      .queryList(this.adjustQuery(removeEmpty({
        ...this.condition,
        ...this.form.value
      })), {
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
      .queryCount(this.adjustQuery(
        removeEmpty({
          ...this.condition,
          ...this.form.value
        })
      ))
      .subscribe((count) => {
        this.totalCount = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // title desc 支持正则查询
    const o: { [key: string]: any } = {
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