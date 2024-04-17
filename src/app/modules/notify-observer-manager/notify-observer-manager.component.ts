import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AirdropInteractionRecord, AirdropInteractionRecordService, NotifyObserver, NotifyObserverService, SharedService, TagTypes } from 'src/app/shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AirdropInteractionRecordModalActions, CreateAirdropInteractionRecordService } from 'src/app/modules/create-airdrop-interaction-record';
import { removeEmpty, removeKeys, removeNullOrUndefined } from 'src/app/utils';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CreateNotifyObserverService, NotifyObserverModalActions } from 'src/app/modules/create-notify-observer'
import { Subscription } from 'rxjs';

interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'notify-observer-manager',
  templateUrl: 'notify-observer-manager.component.html'
})

export class NotifyObserverManagerComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly sharedService: SharedService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly notifyObserverService: NotifyObserverService,
  ) { }

  @Input() airdropJobID: string | null = null;

  total = 0;
  items: TableItem[] = [];
  loading = true;
  pageSize = 12;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  subscriptions: Subscription[] = [];


  ngOnInit(): void {
    this.loadDataFromServer();
  }


  showCreateModal() {
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
      ...(this.airdropJobID ? { airdropJobID: this.airdropJobID } : {})
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

  private loadDataFromServer(): void {
    const query = {
      ...(this.airdropJobID ? { airdropJobID: this.airdropJobID } : {})
    };
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
    // name website 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'notifyShowTitle') {
        Object.assign(o, {
          ['notifyShowTitle']: {
            $regex: query['notifyShowTitle'].trim(),
            $options: 'i',
          },
        });
      } else if (key === 'scriptText') {
        Object.assign(o, {
          ['$or']: [
            { blogScript: { $regex: query['scriptText'].trim(), $options: 'i' } },
            { timerScript: { $regex: query['scriptText'].trim(), $options: 'i' } },
          ],
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }
}