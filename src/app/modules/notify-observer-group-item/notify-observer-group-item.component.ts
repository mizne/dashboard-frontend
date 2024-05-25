import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotifyObserver, NotifyObserverGroup, NotifyObserverService } from 'src/app/shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  CreateNotifyObserverService,
  NotifyObserverModalActions,
} from 'src/app/modules/create-notify-observer';

interface TableItem extends NotifyObserverGroup {
}

interface NotifyObserverTableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'notify-observer-group-item',
  templateUrl: 'notify-observer-group-item.component.html'
})

export class NotifyObserverGroupItemComponent implements OnInit {
  constructor(
    private readonly nzNotificationService: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly notifyObserverService: NotifyObserverService,
  ) { }

  @Input() mode: 'small' | 'default' = 'default'

  @Input() width = 320;
  @Input() item: TableItem | null = null;

  @Output() update = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  showModal = false;
  loading = false;
  items: NotifyObserverTableItem[] = [];

  ngOnInit() { }

  confirmUpdate() {
    this.update.emit();
  }

  confirmDelete() {
    this.delete.emit();
  }

  toShowNotifyObservers() {
    if (this.item && this.item.notifyObserverIDs && this.item.notifyObserverIDs.length > 0) {
      this.showModal = true;
      this.loadNotifyObservers();
    } else {
      this.nzNotificationService.warning(`该组还没有通知源`, `该组还没有通知源`);
    }
  }



  trackByID(index: number, item: NotifyObserverTableItem) {
    return item._id;
  }

  confirmCopyNotifyObserver(item: NotifyObserverTableItem) {
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
      this.loadNotifyObservers();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`复制通知源失败`, `${e.message}`);
    });
  }

  confirmUpdateNotifyObserver(item: NotifyObserverTableItem) {
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
      this.loadNotifyObservers();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`修改通知源失败`, `${e.message}`);
    });
  }


  confirmDeleteNotifyObserver(item: NotifyObserverTableItem) {
    this.notifyObserverService.deleteByID(item._id).subscribe({
      next: () => {
        this.nzNotificationService.success(`删除成功`, `删除数据成功`);
        this.loadNotifyObservers();
      },
      complete: () => { },
      error: (e) => {
        this.nzNotificationService.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  private loadNotifyObservers() {
    if (this.item && this.item.notifyObserverIDs && this.item.notifyObserverIDs.length > 0) {
      this.loading = true;
      this.notifyObserverService
        .queryList({
          _id: {
            $in: this.item.notifyObserverIDs
          }
        } as any)
        .subscribe((results) => {
          this.loading = false;

          this.items = this.item?.notifyObserverIDs?.map(id => {
            const theNotifyObserver = results.find(e => e._id === id);

            if (theNotifyObserver) {
              return {
                ...theNotifyObserver,
                enableTrackingCtrl: new FormControl(!!theNotifyObserver.enableTracking),
                ...(theNotifyObserver.followedProjectID ? {
                  followedProjectIDCtrl: new FormControl(theNotifyObserver.followedProjectID)
                } : {})
              }
            } else {
              return null;
            }
          }).filter(e => !!e) as Array<NotifyObserverTableItem>

          if (this.items.length !== this.item?.notifyObserverIDs?.length) {
            this.nzNotificationService.warning(`也许有通知源被删除`, `也许有通知源被删除`)
          }
        });
    }
  }
}