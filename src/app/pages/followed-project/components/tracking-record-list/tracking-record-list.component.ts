import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CreateFollowedProjectTrackingRecordService, FollowedProjectTrackingRecordModalActions } from 'src/app/modules/create-followed-project-tracking-record';
import { FollowedProjectTrackingRecordService, FollowedProjectTrackingRecord } from 'src/app/shared';
import { removeNullOrUndefined } from 'src/app/utils';


@Component({
  selector: 'app-tracking-record-list',
  templateUrl: './tracking-record-list.component.html',
  styleUrls: ['./tracking-record-list.component.less'],
})
export class TrackingRecordListComponent implements OnInit {
  constructor(
    private readonly followedProjectTrackingRecordService: FollowedProjectTrackingRecordService,
    private readonly notificationService: NzNotificationService,
    private readonly fb: FormBuilder,
    private createFollowedProjectTrackingRecordService: CreateFollowedProjectTrackingRecordService
  ) { }

  @Input() followedProjectID = '';

  total = 0;
  items: FollowedProjectTrackingRecord[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    title: [null],
    description: [null],
  });


  submitForm(): void {
    this.query = removeNullOrUndefined(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset();
    this.query = removeNullOrUndefined(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();
  }

  showCreateModal() {
    const obj: Partial<FollowedProjectTrackingRecord> = {
      ...(this.followedProjectID ? { followedProjectID: this.followedProjectID } : {})
    };
    const { success, error } = this.createFollowedProjectTrackingRecordService.createModal(
      '添加跟踪记录',
      obj,
    );

    success.subscribe((v) => {
      this.notificationService.success(`添加跟踪记录成功`, `添加跟踪记录成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notificationService.error(`添加跟踪记录失败`, `${e.message}`);
    });
  }

  confirmUpdate(item: FollowedProjectTrackingRecord) {
    const obj: Partial<FollowedProjectTrackingRecord> = {
      ...item,
    };
    const { success, error } = this.createFollowedProjectTrackingRecordService.createModal(
      '修改跟踪记录',
      obj,
      FollowedProjectTrackingRecordModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notificationService.success(`修改跟踪记录成功`, `修改跟踪记录成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notificationService.error(`修改跟踪记录失败`, `${e.message}`);
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sort = this.buildSort(sortField, sortOrder);
    this.loadDataFromServer();
  }

  confirmDelete(item: FollowedProjectTrackingRecord) {
    this.followedProjectTrackingRecordService.deleteByID(item._id).subscribe({
      next: () => {
        this.notificationService.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.notificationService.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: FollowedProjectTrackingRecord) { }

  private loadDataFromServer(): void {
    this.loading = true;
    this.followedProjectTrackingRecordService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results;
      });

    this.followedProjectTrackingRecordService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }



  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // title website 支持正则查询
    const o: { [key: string]: any } = {
      ...(this.followedProjectID ? { followedProjectID: this.followedProjectID } : {})
    };
    Object.keys(query).forEach((key) => {
      if (key === 'title') {
        Object.assign(o, {
          ['title']: { $regex: query['title'].trim(), $options: 'i' },
        });
      } else if (key === 'description') {
        Object.assign(o, {
          ['description']: { $regex: query['description'].trim(), $options: 'i' },
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }

  private buildSort(sortField?: string | null, sortOrder?: string | null) {
    if (!sortField) {
      return {
        createdAt: -1,
      };
    }

    if (sortField === 'createdAtStr') {
      if (sortOrder === 'ascend') {
        return {
          [sortField.slice(0, -3)]: 1,
        };
      }
      if (sortOrder === 'descend') {
        return {
          [sortField.slice(0, -3)]: -1,
        };
      }
    }

    return sortOrder === 'ascend'
      ? { [sortField]: 1 }
      : sortOrder === 'descend'
        ? { [sortField]: -1 }
        : {
          createdAt: -1,
        };
  }
}
