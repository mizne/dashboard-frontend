import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  CreateNotifyObserverGroupService,
  NotifyObserverGroupModalActions,
} from 'src/app/modules/create-notify-observer-group';

import {
  NotifyObserverGroup,
  NotifyObserverGroupService,
  SharedService,
} from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';

interface TableItem extends NotifyObserverGroup {
}

@Component({
  selector: 'app-my-notify-observer-group',
  templateUrl: './my-notify-observer-group.component.html',
  styleUrls: ['./my-notify-observer-group.component.less'],
})
export class MyNotifyObserverGroupComponent implements OnInit {
  constructor(
    private readonly notifyObserverGroupService: NotifyObserverGroupService,
    private readonly nzNotificationService: NzNotificationService,
    private message: NzMessageService,
    private readonly fb: FormBuilder,
    private sharedService: SharedService,
    private createNotifyObserverGroupService: CreateNotifyObserverGroupService
  ) { }

  total = 0;
  items: TableItem[] = [];
  loading = true;
  pageSize = 12;
  pageIndex = 1;
  sort: any = {
    createdAt: -1,
  };


  form: FormGroup<any> = this.fb.group({
    title: [null],
    desc: [null],
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
    const obj: Partial<NotifyObserverGroup> = {
    };
    const { success, error } = this.createNotifyObserverGroupService.createModal(
      '添加通知组',
      obj,
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`添加通知组成功`, `添加通知组成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加通知组失败`, `${e.message}`);
    });
  }


  confirmUpdate(item: TableItem) {
    const obj: Partial<NotifyObserverGroup> = {
      ...item,
    };
    const { success, error } = this.createNotifyObserverGroupService.createModal(
      '修改通知组',
      obj,
      NotifyObserverGroupModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`修改通知组成功`, `修改通知组成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`修改通知组失败`, `${e.message}`);
    });
  }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }

  confirmDelete(item: TableItem) {
    this.notifyObserverGroupService.deleteByID(item._id).subscribe({
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
    const query = removeEmpty(this.form.value);
    this.loading = true;
    this.notifyObserverGroupService
      .queryList(
        this.adjustQuery(query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe({
        next: (results) => {
          this.loading = false;
          this.items = results.map((e) => ({
            ...e,

          }));

        }
      });

    this.notifyObserverGroupService
      .queryCount(this.adjustQuery(query))
      .subscribe((count) => {
        this.total = count;
      });
  }




  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // title desc 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'title') {
        Object.assign(o, {
          ['title']: {
            $regex: query['title'].trim(),
            $options: 'i',
          },
        });
      } else if (key === 'desc') {
        Object.assign(o, {
          ['desc']: {
            $regex: query['desc'].trim(),
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
