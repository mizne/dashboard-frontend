import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CreateAirdropAccountService, AirdropAccountModalActions } from 'src/app/modules/create-airdrop-account';

import {
  AirdropAccount,
  AirdropAccountService
} from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';

interface TableItem extends AirdropAccount {
}

@Component({
  selector: 'app-airdrop-account',
  templateUrl: './airdrop-account.component.html',
  styleUrls: ['./airdrop-account.component.less'],
})
export class AirdropAccountComponent implements OnInit {
  constructor(
    private readonly airdropAccountService: AirdropAccountService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private createAirdropAccountService: CreateAirdropAccountService
  ) { }

  total = 0;
  items: TableItem[] = [];
  loading = true;
  pageSize = 12;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    name: [null],
  });

  submitForm(): void {
    this.pageIndex = 1;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
    });

    this.pageIndex = 1;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();
  }

  showCreateModal() {
    const obj: Partial<AirdropAccount> = {};
    const { success, error } = this.createAirdropAccountService.createModal(
      '添加空投账号',
      obj,
    );

    success.subscribe((v) => {
      this.notification.success(`添加空投账号成功`, `添加空投账号成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`添加空投账号失败`, `${e.message}`);
    });
  }



  confirmUpdate(item: TableItem) {
    const obj: Partial<AirdropAccount> = {
      ...item,
    };
    const { success, error } = this.createAirdropAccountService.createModal(
      '修改空投账号',
      obj,
      AirdropAccountModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notification.success(`修改空投账号成功`, `修改空投账号成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`修改空投账号失败`, `${e.message}`);
    });
  }


  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }

  confirmDelete(item: TableItem) {
    this.airdropAccountService.deleteByID(item._id).subscribe({
      next: () => {
        this.notification.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.notification.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: TableItem) { }

  private loadDataFromServer(): void {
    this.query = removeEmpty(this.form.value);
    this.loading = true;
    this.airdropAccountService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map((e) => ({
          ...e,
        }));
      });

    this.airdropAccountService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // name website 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'name') {
        Object.assign(o, {
          ['name']: {
            $regex: query['name'].trim(),
            $options: 'i',
          },
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }
}
