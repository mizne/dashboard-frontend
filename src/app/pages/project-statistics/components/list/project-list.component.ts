import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import {
  CreateProjectService,
  ProjectModalActions,
} from 'src/app/modules/create-project';
import { Project, ProjectService } from 'src/app/shared';
import { removeNullOrUndefined } from 'src/app/utils';
import validator from 'validator';

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
  ) {}

  total = 1;
  items: Project[] = [];
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
  });

  submitForm(): void {
    console.log('submitForm', this.form.value);
    this.query = removeNullOrUndefined(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset();
    console.log('resetForm', this.form.value);
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

  confirmUpdate(item: Project) {
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
    console.log('onQueryParamsChange ', params);
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sort = this.buildSort(sortField, sortOrder);
    this.loadDataFromServer();
  }

  confirmDelete(item: Project) {
    console.log(`confirmDelete(): `, item);
    this.projectService.deleteByID(item._id).subscribe({
      next: () => {
        this.notification.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => {},
      error: (e) => {
        this.notification.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: Project) {}

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
        this.loading = false;
        this.items = results;
      });

    this.projectService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'website' && validator.isURL(query['website'])) {
        Object.assign(o, { website: new URL(query['website']).hostname });
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
