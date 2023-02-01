import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CreateFollowedProjectService, FollowedProjectModalActions } from 'src/app/modules/create-followed-project';

import {
  FollowedProject,
  FollowedProjectService
} from 'src/app/shared';
import { removeEmpty } from 'src/app/utils';

interface TableItem extends FollowedProject {
  tagIDsCtrl: FormControl;
}

@Component({
  selector: 'app-followed-project',
  templateUrl: './followed-project.component.html',
  styleUrls: ['./followed-project.component.less'],
})
export class FollowedProjectComponent implements OnInit {
  constructor(
    private readonly followedProjectService: FollowedProjectService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private viewContainerRef: ViewContainerRef,
    private createFollowedProjectService: CreateFollowedProjectService
  ) { }

  total = 1;
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
    hasNews: [null],
    hasLaunchToken: [null],
    tagIDs: [null],
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
    const obj: Partial<FollowedProject> = {};
    const { success, error } = this.createFollowedProjectService.createModal(
      '添加关注项目',
      obj,
      this.viewContainerRef
    );

    success.subscribe((v) => {
      this.notification.success(`添加关注项目成功`, `添加关注项目成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`添加关注项目失败`, `${e.message}`);
    });
  }

  confirmRead(item: TableItem) {
    this.followedProjectService.update(item._id, { hasNews: false }).subscribe({
      next: () => {
        this.notification.success(`标记已读成功`, `标记已读成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.notification.error(`标记已读失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  confirmUpdate(item: TableItem) {
    const obj: Partial<FollowedProject> = {
      ...item,
    };
    const { success, error } = this.createFollowedProjectService.createModal(
      '修改关注项目',
      obj,
      this.viewContainerRef,
      FollowedProjectModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notification.success(`修改关注项目成功`, `修改关注项目成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`修改关注项目失败`, `${e.message}`);
    });
  }

  projectDetailHref(id: string): string {
    return `${location.protocol}//${location.host}/followed-project/detail/${id}`;
  }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }

  confirmDelete(item: TableItem) {
    this.followedProjectService.deleteByID(item._id).subscribe({
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
    this.followedProjectService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map((e) => ({
          ...e,
          tagIDsCtrl: new FormControl(e.tagIDs),
        }));
      });

    this.followedProjectService
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
            $regex: query['name'],
            $options: 'i',
          },
        });
      } else if (key === 'tagIDs') {
        if (Array.isArray(query['tagIDs']) && query['tagIDs'].length > 0) {
          Object.assign(o, {
            $or: query['tagIDs'].map((f: string) => ({ tagIDs: f }))
          })
        }
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }
}
