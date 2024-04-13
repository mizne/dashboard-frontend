import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CreateAirdropAccountService, AirdropAccountModalActions } from 'src/app/modules/create-airdrop-account';
import { CreateNotifyObserverService, NotifyObserverModalActions } from 'src/app/modules/create-notify-observer';
import { ClientNotifyService, AirdropAccount, AirdropAccountService, NotifyObserver, NotifyObserverService, } from 'src/app/shared';
import { DestroyService } from 'src/app/shared/services/destroy.service';

// interface TableItem extends NotifyObserver {
//   enableTrackingCtrl: FormControl;
//   airdropAccountIDCtrl?: FormControl;
// }

interface Detail extends AirdropAccount {
  // tagIDsCtrl: FormControl
}

@Component({
  selector: 'airdrop-account-detail',
  templateUrl: 'airdrop-account-detail.component.html',
  styleUrls: ['./airdrop-account-detail.component.less'],
  providers: [DestroyService]
})

export class AirdropAccountDetailComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly airdropAccountService: AirdropAccountService,
    private readonly notifyObserverService: NotifyObserverService,
    private readonly notificationService: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
    private readonly destroy$: DestroyService,
    private readonly clientNotifyService: ClientNotifyService,
    private createAirdropAccountService: CreateAirdropAccountService
  ) { }

  airdropAccountID = this.route.snapshot.params['id'];
  airdropAccountDetail: Detail | null = null;
  loadingAirdropAccount = false;


  // notifyObservers: TableItem[] = [];
  loadingNotifyObservers = false;


  ngOnInit() {
    this.fetchAirdropAccountDetail();
    this.fetchAirdropJobs();
  }

  confirmUpdateAirdropAccount() {
    if (!this.airdropAccountID || !this.airdropAccountDetail) {
      return;
    }

    const obj: Partial<AirdropAccount> = {
      ...this.airdropAccountDetail,
    };
    const { success, error } = this.createAirdropAccountService.createModal(
      '修改空投账号',
      obj,
      AirdropAccountModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notificationService.success(`修改空投账号成功`, `修改空投账号成功`);
      this.fetchAirdropAccountDetail();
    });
    error.subscribe((e) => {
      this.notificationService.error(`修改空投账号失败`, `${e.message}`);
    });
  }

  // showCreateNotifyObserverModal() {
  //   if (!this.airdropAccountID) {
  //     return;
  //   }
  //   const obj: Partial<NotifyObserver> = {
  //     enableTracking: true,
  //     airdropAccountID: this.airdropAccountID
  //   };
  //   const { success, error } = this.createNotifyObserverService.createModal(
  //     '添加通知源',
  //     obj,
  //   );

  //   success.subscribe((v) => {
  //     this.notificationService.success(`添加通知源成功`, `添加通知源成功`);
  //     this.fetchAirdropJobs();
  //   });
  //   error.subscribe((e) => {
  //     this.notificationService.error(`添加通知源失败`, `${e.message}`);
  //   });
  // }

  // confirmUpdate(item: TableItem) {
  //   const obj: Partial<NotifyObserver> = {
  //     ...item,
  //   };
  //   const { success, error } = this.createNotifyObserverService.createModal(
  //     '修改通知源',
  //     obj,
  //     NotifyObserverModalActions.UPDATE
  //   );

  //   success.subscribe((v) => {
  //     this.notificationService.success(`修改通知源成功`, `修改通知源成功`);
  //     this.fetchAirdropJobs();
  //   });
  //   error.subscribe((e) => {
  //     this.notificationService.error(`修改通知源失败`, `${e.message}`);
  //   });
  // }

  // confirmDelete(item: TableItem) {
  //   this.notifyObserverService.deleteByID(item._id).subscribe({
  //     next: () => {
  //       this.notificationService.success(`删除成功`, `删除数据成功`);
  //       this.fetchAirdropJobs();
  //     },
  //     complete: () => { },
  //     error: (e) => {
  //       this.notificationService.error(`删除失败`, `请稍后重试，${e.message}`);
  //     },
  //   });
  // }

  private fetchAirdropAccountDetail() {
    if (!this.airdropAccountID) {
      return
    }
    this.loadingAirdropAccount = true;
    this.airdropAccountService.queryList({ _id: this.airdropAccountID })
      .subscribe({
        next: (items: AirdropAccount[]) => {
          this.loadingAirdropAccount = false;
          if (items.length > 0) {
            this.airdropAccountDetail = {
              ...items[0],
            }
          } else {
            this.notificationService.warning(`没有找到 空投账号详情`, `也许已经被删除`)
          }
        },
        error: (err: Error) => {
          this.loadingAirdropAccount = false;
          this.notificationService.error(`获取 空投账号详情 失败`, `${err.message}`)
        }
      })
  }


  private fetchAirdropJobs() {
    // if (!this.airdropAccountID) {
    //   return
    // }

    // this.loadingNotifyObservers = true;
    // this.notifyObserverService.queryList({ airdropAccountID: this.airdropAccountID })
    //   .subscribe({
    //     next: (items: NotifyObserver[]) => {
    //       this.loadingNotifyObservers = false;
    //       if (items.length > 0) {
    //         this.unsubscribeUpdateEnableTrackingCtrls();
    //         this.notifyObservers = items.map((e) => ({
    //           ...e,
    //           enableTrackingCtrl: new FormControl(!!e.enableTracking),
    //           ...(e.airdropAccountID ? {
    //             airdropAccountIDCtrl: new FormControl(e.airdropAccountID)
    //           } : {})
    //         }))
    //         this.subscribeUpdateEnableTrackingCtrls();
    //       } else {
    //         this.notifyObservers = [];
    //         this.notificationService.warning(`没有找到 通知源`, `也许该项目还没有添加通知源`)
    //       }
    //     },
    //     error: (err: Error) => {
    //       this.loadingNotifyObservers = false;
    //       this.notificationService.error(`获取 通知源 失败`, `${err.message}`)
    //     }
    //   })
  }

}