import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CreateAirdropAccountService, AirdropAccountModalActions } from 'src/app/modules/create-airdrop-account';
import { AirdropAccount, AirdropAccountService, AirdropAccountAttendJob, } from 'src/app/shared';
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
    private readonly notificationService: NzNotificationService,
    private readonly createAirdropAccountService: CreateAirdropAccountService
  ) { }

  airdropAccountID = this.route.snapshot.params['id'];
  airdropAccountDetail: Detail | null = null;
  loadingAirdropAccount = false;




  ngOnInit() {
    this.fetchAirdropAccountDetail();
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




}