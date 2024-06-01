import { Component, OnInit, Input } from '@angular/core';
import { TaskRecord, TaskRecordService, Legend } from 'src/app/shared';
import { DestroyService } from 'src/app/shared/services/destroy.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { removeNullOrUndefined } from 'src/app/utils';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { lastValueFrom } from 'rxjs';
import { format, parse } from 'date-fns';
import { currentHour } from '../../../utils';
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
    duration: [null],
    time: [null]
  })

  loadingChart = false;

  lastHours = 24
  title = `最近${this.lastHours}小时 任务时长分布`;
  data: Array<{
    time: string;
    type: string;
    value: number;
  }> = [];
  colors: string[] = [
  ]
  legends: Array<any> = [
    {
      type: {
        $lt: 1 * 60 * 1e3,
      },
      label: '< 1分钟',
      color: 'rgb(35, 139, 69)'
    },
    {
      type: {
        $gte: 1 * 60 * 1e3,
        $lt: 10 * 60 * 1e3,
      },
      label: '1 ~ 10分钟',
      color: 'rgb(199, 233, 192)'
    },
    {
      type: {
        $gte: 10 * 60 * 1e3,
        $lt: 60 * 60 * 1e3,
      },
      label: '10 ~ 60分钟',
      color: 'rgb(252, 187, 161)'
    },
    {
      type: {
        $gte: 60 * 60 * 1e3,
      },
      label: '>= 1小时',
      color: 'rgb(203, 24, 29)'
    },
  ]

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

    this.loadChartData()
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

  private async loadChartData() {
    this.loadingChart = true;
    this.data = [];
    this.colors = this.legends.map(e => e.color)

    const now = new Date().getTime();
    const times = Array.from({ length: this.lastHours }, (_, i) => i).reverse();
    const timeDurations = times.map(e => {
      const startHour = currentHour(now - e * 60 * 60 * 1e3);
      const endHour = startHour + 60 * 60 * 1e3
      return {
        startHour, endHour
      }
    })

    for (const timeDuration of timeDurations) {
      for (const legend of this.legends) {
        const count = await this.fetchTaskRecordCount({
          startAt: {
            $gte: timeDuration.startHour,
            $lt: timeDuration.endHour
          },
          duration: legend.type
        })

        this.data = [
          ...this.data,
          {
            time: format(timeDuration.startHour, 'dd HH:mm') + ' ~ ' + format(timeDuration.endHour, 'dd HH:mm'),
            type: legend.label,
            value: count
          }
        ]
      }
    }

    this.loadingChart = false;

  }

  private async fetchTaskRecordCount(query: any): Promise<number> {
    return lastValueFrom(this.taskRecordService.queryCount(query))
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
      } else if (key === 'time') {
        const timeObj = {}
        if (query['time'][0]) {
          Object.assign(timeObj, { $gte: query['time'][0].getTime() })
        }
        if (query['time'][1]) {
          Object.assign(timeObj, { $lt: query['time'][1].getTime() })
        }
        if (Object.keys(timeObj).length > 0) {
          Object.assign(o, {
            ['startAt']: timeObj,
          });
        }
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