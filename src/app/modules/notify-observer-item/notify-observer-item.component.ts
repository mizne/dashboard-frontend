import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NotifyHistory, NotifyHistoryService, NotifyObserver, NotifyObserverNotAllow, NotifyObserverTypes, SharedService } from 'src/app/shared';
import { NotifyObserverTypeManagerService } from 'src/app/modules/create-notify-observer';
import { removeEmpty } from 'src/app/utils';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CreateNotifyObserverNotAllowService } from 'src/app/modules/create-notify-observer-not-allow';
import { CreateNotifyObserverService } from 'src/app/modules/create-notify-observer';


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
  ) { }

  @Input() mode: 'small' | 'default' = 'default'

  @Input() width = 320;
  @Input() item: TableItem | null = null;

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
    hasRead: [this.readStatuses[2].value],
  });

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

  toSearch() {
    this.search.emit();
  }

  toShowNotifyHistory() {
    this.showModal = true;
    this.loadDataFromServer();
  }

  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 6;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      hasRead: this.readStatuses[2].value,
    });
    this.pageIndex = 1;
    this.pageSize = 6;
    this.loadDataFromServer();
  }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }

  markRead(item: NotifyHistoryTableItem) {
    this.loadDataFromServer();
  }

  trackByID(index: number, item: NotifyHistoryTableItem) {
    return item._id;
  }

  private loadDataFromServer() {
    this.loading = true;
    this.notifyHistoryService
      .queryList(removeEmpty({
        notifyObserverID: this.item?._id,
        ...this.form.value
      }), {
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
      .queryCount(removeEmpty({
        notifyObserverID: this.item?._id,
        ...this.form.value
      }))
      .subscribe((count) => {
        this.totalCount = count;
      });
  }
}