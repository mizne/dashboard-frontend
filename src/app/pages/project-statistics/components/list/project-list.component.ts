import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subscription } from 'rxjs';
import {
  CreateProjectService,
  ProjectModalActions,
} from 'src/app/modules/create-project';
import { Project, ProjectService } from 'src/app/shared';
import { removeNullOrUndefined } from 'src/app/utils';
import validator from 'validator';

interface TableItem extends Project {
  enableTrackingCtrl: FormControl;
}

@Component({
  selector: 'app-porject-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.less'],
})
export class ProjectListComponent implements OnInit {
  constructor(
    private readonly projectService: ProjectService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
    private viewContainerRef: ViewContainerRef,
    private createProjectService: CreateProjectService
  ) { }

  total = 1;
  items: TableItem[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    name: [null],
    website: [null],
    enableTracking: [null],
    investors: [null],
  });
  investors = [
    {
      name: 'a16z',
    },
    {
      name: 'binance_labs',
    },
    {
      name: 'multicoin_capital',
    },
    {
      name: 'coinbase_ventures',
    },
    {
      name: 'animoca_brands',
    },
    {
      name: 'sequioa_capital_india',
    },
    {
      name: 'delphi_digital',
    },
    {
      name: 'alameda_research',
    },
    {
      name: 'paradigm',
    },
    {
      name: 'ftx_ventures',
    },
  ];

  subscriptions: Subscription[] = [];

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
    const obj: Partial<Project> = {
      enableTracking: false,
    };
    const { success, error } = this.createProjectService.createModal(
      '添加项目',
      obj,
      this.viewContainerRef
    );

    success.subscribe((v) => {
      this.notification.success(`添加项目成功`, `添加项目成功`);
    });
    error.subscribe((e) => {
      this.notification.error(`添加项目失败`, `${e.message}`);
    });
  }

  confirmUpdate(item: TableItem) {
    const obj: Partial<Project> = {
      ...item,
    };
    const { success, error } = this.createProjectService.createModal(
      '修改项目',
      obj,
      this.viewContainerRef,
      ProjectModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notification.success(`修改项目成功`, `修改项目成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`修改项目失败`, `${e.message}`);
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

  confirmDelete(item: TableItem) {
    this.projectService.deleteByID(item._id).subscribe({
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

  projectDetailHref(id: string): string {
    return `${location.protocol}//${location.host}/project-statistics/detail/${id}`;
  }

  private loadDataFromServer(): void {
    this.loading = true;
    this.projectService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.unsubscribeUpdateEnableTrackingCtrls();
        this.loading = false;
        this.items = results.map((e) => ({
          ...e,
          enableTrackingCtrl: new FormControl(!!e.enableTracking),
        }));

        this.subscribeUpdateEnableTrackingCtrls();
      });

    this.projectService
      .queryCount(this.adjustQuery(this.query))
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
        this.projectService
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
      if (key === 'website') {
        Object.assign(o, {
          website: query['website'].startsWith('http')
            ? { $regex: new URL(query['website']).hostname, $options: 'i' }
            : { $regex: query['website'].trim(), $options: 'i' },
        });
      } else if (key === 'name') {
        Object.assign(o, {
          ['name']: { $regex: query['name'].trim(), $options: 'i' },
        });
      } else {
        Object.assign(o, { [key]: query[key].trim() });
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

    if (sortField === 'investDateStr' || sortField === 'createdAtStr') {
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
