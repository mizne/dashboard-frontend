import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NotifyHistory, NotifyHistoryService, NotifyObserver, NotifyObserverService } from 'src/app/shared';
import { NotifyObserverTypeManagerService } from 'src/app/modules/create-notify-observer';
import { removeEmpty } from 'src/app/utils';
import { NzNotificationService } from 'ng-zorro-antd/notification';


interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

interface NotifyHistoryTableItem extends NotifyHistory {
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'notify-observer-item',
  templateUrl: 'notify-observer-item.component.html'
})

export class NotifyObserverItemComponent implements OnInit {
  constructor(
    private readonly notifyObserverTypeService: NotifyObserverTypeManagerService,
    private readonly notifyHistoryService: NotifyHistoryService,
    private readonly fb: FormBuilder,
    private readonly nzNotificationService: NzNotificationService,
    private readonly notifyObserverService: NotifyObserverService,
  ) { }

  @Input() mode: 'small' | 'default' = 'default'

  @Input() width = 320;
  @Input() item: TableItem | null = null;

  @Input() enableEdit = true;
  @Input() enableDelete = true;

  @Output() update = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() search = new EventEmitter<void>();

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

  showStatisticsModal = false;

  ngOnInit() { }

  resolveHref(item: TableItem) {
    return this.notifyObserverTypeService.resolveHref(item)
  }

  resolveDesc(item: TableItem) {
    return this.notifyObserverTypeService.resolveDesc(item)
  }

  confirmUpdate() {
    this.update.emit();
  }

  confirmDelete() {
    this.delete.emit();
  }

  confirmTimerExecute() {
    if (!this.item) {
      return
    }

    this.notifyObserverService.timerExecute(this.item._id).subscribe({
      next: () => {
        this.nzNotificationService.success(`启动定时任务成功`, `启动定时任务成功`);
      },
      complete: () => { },
      error: (e) => {
        this.nzNotificationService.error(`启动定时任务失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  toSearch() {
    this.search.emit();
  }

  toShowNotifyHistory() {
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

  markRead(item: NotifyHistoryTableItem) {
    this.loadNotifyHistory();
  }

  trackByID(index: number, item: NotifyHistoryTableItem) {
    return item._id;
  }


  toShowStatistics() {
    if (this.item?.timerStatisticsDefinitions && this.item.timerStatisticsDefinitions.length > 0) {
      this.showStatisticsModal = true;
    } else {
      this.nzNotificationService.warning(`还没有统计表定义`, `还没有统计表定义`)
    }
  }

  private loadNotifyHistory() {
    this.loading = true;
    this.notifyHistoryService
      .queryList(this.adjustQuery(removeEmpty({
        notifyObserverID: this.item?._id,
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
          notifyObserverID: this.item?._id,
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