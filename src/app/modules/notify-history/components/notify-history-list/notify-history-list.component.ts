import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { removeEmpty } from 'src/app/utils';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, Observable } from 'rxjs';
import { DestroyService } from 'src/app/shared/services/destroy.service';
import { NotifyHistory, NotifyHistoryService, NotifyObserver, NotifyObserverNotAllow, NotifyObserverTypes, SharedService } from 'src/app/shared';
import { CreateNotifyObserverNotAllowService } from 'src/app/modules/create-notify-observer-not-allow';
import { CreateNotifyObserverService } from 'src/app/modules/create-notify-observer';

interface TableItem extends NotifyHistory {
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'notify-history-list',
  templateUrl: 'notify-history-list.component.html',
  providers: [DestroyService],

})
export class NotifyHistoryListComponent implements OnInit, OnChanges {
  constructor(
    private readonly fb: FormBuilder,
    private readonly notifyHistoryService: NotifyHistoryService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly createNotifyObserverNotAllowService: CreateNotifyObserverNotAllowService,
    private readonly sharedService: SharedService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
  ) { }

  @Input() condition: any = null
  @Input() refreshObs: Observable<void> = EMPTY

  loading = false;
  items: TableItem[] = [];
  totalCount = 0;
  pageIndex = 1;
  pageSize = 10;

  query: { [key: string]: any } = {};
  types = [
    {
      label: '所有',
      value: '',
    },
  ];
  readStatuses = [
    {
      label: '未读',
      value: false,
    },
    {
      label: '已读',
      value: true,
    },
    {
      label: '所有',
      value: '',
    },
  ];
  form = this.fb.group({
    title: [null],
    desc: [null],
    type: [this.types[0].value],
    hasRead: [this.readStatuses[0].value],
  });

  ngOnInit() {
    this.loadDataFromServer();

    this.refreshObs.subscribe(() => {
      this.loadDataFromServer();
    })

    this.notifyHistoryService.queryTypes()
      .subscribe((types) => {
        this.types = [
          {
            label: '所有',
            value: '',
          },
          ...types
        ]
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.condition && this.condition['type']) {
      this.form.patchValue({
        type: this.condition['type']
      })
    }
  }

  trackByID(index: number, item: TableItem) {
    return item._id;
  }

  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
      type: this.types[0].value,
      hasRead: this.readStatuses[0].value,
    });
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  markRead(item: NotifyHistory) {
    this.loadDataFromServer();
  }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }

  private loadDataFromServer() {
    this.query = removeEmpty(this.form.value);
    this.loading = true;
    this.notifyHistoryService
      .queryList(this.adjustQuery(this.query), {
        number: this.pageIndex,
        size: this.pageSize,
      })
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map(e => ({
          ...e,
          ...(e.followedProjectID ? {
            followedProjectIDCtrl: new FormControl(e.followedProjectID)
          } : {})
        }));
      });

    this.notifyHistoryService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.totalCount = count;
      });
  }
  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // title desc 支持正则查询
    const o: { [key: string]: any } = {
      ...this.condition
    };
    Object.keys(query).forEach((key) => {
      if (key === 'title') {
        Object.assign(o, {
          ['title']: { $regex: query['title'].trim(), $options: 'i' },
        });
      } else if (key === 'desc') {
        Object.assign(o, {
          ['desc']: { $regex: query['desc'].trim(), $options: 'i' },
        });
      } else if (key === 'hasRead' && query['hasRead'] === false) {
        Object.assign(o, {
          ['hasRead']: { $in: [false, undefined, null] },
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }
}
