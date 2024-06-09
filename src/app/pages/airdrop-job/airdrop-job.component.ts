import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CreateAirdropAccountAttendJobService } from 'src/app/modules/create-airdrop-account-attend-job/create-airdrop-account-attend-job.service';
import { CreateAirdropJobService, AirdropJobModalActions } from 'src/app/modules/create-airdrop-job';
import { AirdropJobService, AirdropJob, TagTypes, AirdropJobStatus, AirdropAccountAttendJob, AirdropAccountAttendJobService } from 'src/app/shared';
import { removeKeys, removeNullOrUndefined } from 'src/app/utils';

interface TableItem extends AirdropJob {
  followedProjectIDCtrl: FormControl;
}

interface AttendJobTableItem extends AirdropAccountAttendJob {
  airdropAccountIDCtrl: FormControl
}

@Component({
  selector: 'app-airdrop-job',
  templateUrl: './airdrop-job.component.html',
  styleUrls: ['./airdrop-job.component.less'],
})
export class AirdropJobComponent implements OnInit {
  constructor(
    private readonly airdropJobService: AirdropJobService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private createAirdropJobService: CreateAirdropJobService,
    private airdropAccountAttendJobService: AirdropAccountAttendJobService,
    private createAirdropAccountAttendJobService: CreateAirdropAccountAttendJobService,
  ) { }

  total = 0;
  items: TableItem[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form: FormGroup<any> = this.fb.group({
    title: [null],
    status: [AirdropJobStatus.IN_PROGRESS],
    followedProjectID: [null],
  });
  statuses = [
    {
      label: '所有',
      value: null
    },
    {
      label: '未开始',
      value: AirdropJobStatus.NOT_STARTED
    },
    {
      label: '进行中',
      value: AirdropJobStatus.IN_PROGRESS
    },
    {
      label: '已结束',
      value: AirdropJobStatus.HAS_ENDED
    }
  ]

  manageAttendJobModalVisible = false;
  manageAirdropInteractionRecordModalVisible = false;

  manageNotifyObserverModalVisible = false;

  airdropJobID: null | string = null;
  selectedAirdropJobTitle: null | string = null;



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

  toSearch(item: TableItem) {
    if (item.followedProjectID) {
      this.form.patchValue({ followedProjectID: item.followedProjectID });
      this.submitForm();
    }
  }

  showCreateModal() {
    const obj: Partial<AirdropJob> = {
    };
    const { success, error } = this.createAirdropJobService.createModal(
      '添加空投任务',
      obj,
    );

    success.subscribe((v) => {
      this.notification.success(`添加空投任务成功`, `添加空投任务成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`添加空投任务失败`, `${e.message}`);
    });
  }

  confirmUpdate(item: AirdropJob) {
    const obj: Partial<AirdropJob> = {
      ...item,
    };
    const { success, error } = this.createAirdropJobService.createModal(
      '修改空投任务',
      obj,
      AirdropJobModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notification.success(`修改空投任务成功`, `修改空投任务成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`修改空投任务失败`, `${e.message}`);
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

  confirmDelete(item: AirdropJob) {
    this.airdropJobService.deleteByID(item._id).subscribe({
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

  cancelDelete(item: AirdropJob) { }

  showManageAttendJobModal(item: AirdropJob) {
    this.manageAttendJobModalVisible = true;
    this.airdropJobID = item._id;
    this.selectedAirdropJobTitle = item.title;
  }

  showManageAirdropInteractionRecordModal(item: AirdropJob) {
    this.manageAirdropInteractionRecordModalVisible = true;
    this.airdropJobID = item._id;
    this.selectedAirdropJobTitle = item.title;
  }

  showManageNotifyObserverModal(item: AirdropJob) {
    this.manageNotifyObserverModalVisible = true;
    this.airdropJobID = item._id;
    this.selectedAirdropJobTitle = item.title;
  }

  private loadDataFromServer(): void {
    this.loading = true;
    this.airdropJobService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map(e => ({
          ...e,
          followedProjectIDCtrl: new FormControl(e.followedProjectID),
        }));
      });

    this.airdropJobService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }



  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // title 支持正则查询
    const o: { [key: string]: any } = {
    };
    Object.keys(query).forEach((key) => {
      if (key === 'title') {
        Object.assign(o, {
          ['title']: { $regex: query['title'].trim(), $options: 'i' },
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
