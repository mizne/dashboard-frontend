import { Component, OnInit, Input } from '@angular/core';
import { TaskRecord, TaskRecordService } from 'src/app/shared';
import { DestroyService } from 'src/app/shared/services/destroy.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { removeNullOrUndefined } from 'src/app/utils';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
@Component({
  selector: 'task-record-modal',
  templateUrl: 'task-record-modal.component.html',
  providers: [DestroyService]
})

export class TaskRecordModalComponent implements OnInit {
  constructor(
    private readonly destroyService: DestroyService,
    private readonly taskRecordService: TaskRecordService,
    private readonly fb: FormBuilder,
  ) { }

  @Input() condition: { [key: string]: any } = {};

  visible = false;

  total = 0;
  items: TaskRecord[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  durations = [
    {
      label: '所有',
      value: null
    },
    {
      label: '< 1分钟',
      value: {
        $lt: 60 * 1e3
      }
    },
    {
      label: '1 ~ 10分钟',
      value: {
        $gte: 60 * 1e3,
        $lt: 10 * 60 * 1e3
      }
    },
    {
      label: '10 ~ 60分钟',
      value: {
        $gte: 10 * 60 * 1e3,
        $lt: 60 * 60 * 1e3
      }
    },
    {
      label: '>= 1小时',
      value: {
        $gte: 60 * 60 * 1e3,
      }
    },
  ]

  form: FormGroup<any> = this.fb.group({
    name: [null],
    key: [null],
    hasError: [null],
    duration: [null]
  })

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

  open() {
    this.visible = true;
    this.loadDataFromServer();
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

  private loadDataFromServer(): void {
    this.loading = true;
    this.taskRecordService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map(e => ({
          ...e,
        }));
      });

    this.taskRecordService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }



  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // title website 支持正则查询
    const o: { [key: string]: any } = {
      ...this.condition
    };
    Object.keys(query).forEach((key) => {
      if (key === 'name') {
        Object.assign(o, {
          ['name']: { $regex: query['name'].trim(), $options: 'i' },
        });
      } else if (key === 'key') {
        Object.assign(o, {
          ['key']: { $regex: query['key'].trim(), $options: 'i' },
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