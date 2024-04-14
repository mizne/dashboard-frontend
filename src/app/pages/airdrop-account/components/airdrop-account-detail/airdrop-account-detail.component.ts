import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CreateAirdropAccountService, AirdropAccountModalActions } from 'src/app/modules/create-airdrop-account';
import { CreateAirdropAccountAttendJobService, AirdropAccountAttendJobModalActions } from 'src/app/modules/create-airdrop-account-attend-job';
import { ClientNotifyService, AirdropAccount, AirdropAccountService, NotifyObserver, NotifyObserverService, AirdropAccountAttendJob, AirdropAccountAttendJobService, } from 'src/app/shared';
import { DestroyService } from 'src/app/shared/services/destroy.service';

interface TableItem extends AirdropAccountAttendJob {
  airdropJobIDCtrl: FormControl;
}

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
    private readonly airdropAccountAttendJobService: AirdropAccountAttendJobService,
    private readonly notificationService: NzNotificationService,
    private readonly createAttendJobService: CreateAirdropAccountAttendJobService,
    private readonly destroy$: DestroyService,
    private readonly clientNotifyService: ClientNotifyService,
    private createAirdropAccountService: CreateAirdropAccountService
  ) { }

  airdropAccountID = this.route.snapshot.params['id'];
  airdropAccountDetail: Detail | null = null;
  loadingAirdropAccount = false;


  attendJobs: TableItem[] = [];
  loadingAttendJobs = false;


  ngOnInit() {
    this.fetchAirdropAccountDetail();
    this.fetchAirdropAccountAttendJobs();
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

  showCreateAttendJobModal() {
    if (!this.airdropAccountID) {
      return;
    }
    const obj: Partial<AirdropAccountAttendJob> = {
      airdropAccountID: this.airdropAccountID
    };
    const { success, error } = this.createAttendJobService.createModal(
      '参加任务',
      obj,
    );

    success.subscribe((v) => {
      this.notificationService.success(`参加任务成功`, `参加任务成功`);
      this.fetchAirdropAccountAttendJobs();
    });
    error.subscribe((e) => {
      this.notificationService.error(`参加任务失败`, `${e.message}`);
    });
  }


  confirmDeleteAttendJob(item: AirdropAccountAttendJob) {
    this.airdropAccountAttendJobService.deleteByID(item._id).subscribe({
      next: () => {
        this.notificationService.success(`删除成功`, `删除数据成功`);
        this.fetchAirdropAccountAttendJobs();
      },
      complete: () => { },
      error: (e) => {
        this.notificationService.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

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


  private fetchAirdropAccountAttendJobs() {
    if (!this.airdropAccountID) {
      return
    }

    this.loadingAttendJobs = true;
    this.airdropAccountAttendJobService.queryList({ airdropAccountID: this.airdropAccountID })
      .subscribe({
        next: (items: AirdropAccountAttendJob[]) => {
          this.loadingAttendJobs = false;
          if (items.length > 0) {
            this.attendJobs = items.map((e) => ({
              ...e,
              airdropJobIDCtrl: new FormControl(e.airdropJobID)
            }))
          } else {
            this.attendJobs = [];
            this.notificationService.warning(`没有找到 参加任务`, `也许该项目还没有添加参加任务`)
          }
        },
        complete: () => { },
        error: (err: Error) => {
          this.loadingAttendJobs = false;
          this.notificationService.error(`获取 参加任务 失败`, `${err.message}`)
        }
      })
  }

}