import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AirdropInteractionRecord, AirdropInteractionRecordService, SharedService, TagTypes } from 'src/app/shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AirdropInteractionRecordModalActions, CreateAirdropInteractionRecordService } from 'src/app/modules/create-airdrop-interaction-record';
import { removeEmpty, removeKeys } from 'src/app/utils';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

interface TableItem extends AirdropInteractionRecord {
  airdropAccountIDCtrl: FormControl;
  airdropJobIDCtrl: FormControl;
  tagIDsCtrl: FormControl;
}

@Component({
  selector: 'airdrop-interaction-record-manager',
  templateUrl: 'airdrop-interaction-record-manager.component.html'
})

export class AirdropInteractionRecordManagerComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly sharedService: SharedService,
    private readonly notification: NzNotificationService,
    private readonly createAirdropInteractionRecordService: CreateAirdropInteractionRecordService,
    private readonly airdropInteractionRecordService: AirdropInteractionRecordService,
  ) { }

  @Input() airdropJobID: string | null = null;
  @Input() airdropAccountID: string | null = null;

  total = 0;
  items: TableItem[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  sort: any = {
    createdAt: -1,
  };

  tagType = TagTypes.AIRDROP_INTERACTION_RECORD_CATEGORY
  form: FormGroup<any> = this.fb.group({
    title: [null],
    description: [null],
    airdropAccountID: [],
    airdropJobID: [],
    tagIDs: []
  });


  submitForm(): void {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset();
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.patchForm();
    this.loadDataFromServer();
  }

  private patchForm() {
    this.form.patchValue({
      airdropAccountID: this.airdropAccountID,
      airdropJobID: this.airdropJobID
    })
  }

  showCreateModal() {
    const obj: Partial<AirdropInteractionRecord> = {
      ...this.airdropAccountID ? { airdropAccountID: this.airdropAccountID } : {},
      ...this.airdropJobID ? { airdropJobID: this.airdropJobID } : {},
    };
    const { success, error } = this.createAirdropInteractionRecordService.createModal(
      '添加空投交互记录',
      obj,
    );

    success.subscribe((v) => {
      this.notification.success(`添加空投交互记录成功`, `添加空投交互记录成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`添加空投交互记录失败`, `${e.message}`);
    });
  }

  confirmCopy(item: AirdropInteractionRecord) {
    const obj: Partial<AirdropInteractionRecord> = {
      ...removeKeys(item, ['_id', 'createdAt', 'createdAtStr']),
    };
    const { success, error } = this.createAirdropInteractionRecordService.createModal(
      '添加空投交互记录',
      obj,
      AirdropInteractionRecordModalActions.CREATE
    );

    success.subscribe((v) => {
      this.notification.success(`添加空投交互记录成功`, `添加空投交互记录成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`添加空投交互记录失败`, `${e.message}`);
    });
  }

  confirmUpdate(item: AirdropInteractionRecord) {
    const obj: Partial<AirdropInteractionRecord> = {
      ...item,
    };
    const { success, error } = this.createAirdropInteractionRecordService.createModal(
      '修改空投交互记录',
      obj,
      AirdropInteractionRecordModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.notification.success(`修改空投交互记录成功`, `修改空投交互记录成功`);
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.notification.error(`修改空投交互记录失败`, `${e.message}`);
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

  confirmDelete(item: AirdropInteractionRecord) {
    this.airdropInteractionRecordService.deleteByID(item._id).subscribe({
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

  cancelDelete(item: AirdropInteractionRecord) { }

  private loadDataFromServer(): void {
    this.loading = true;
    this.airdropInteractionRecordService
      .queryList(
        this.adjustQuery(removeEmpty(this.form.value)),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map(e => ({
          ...e,
          airdropAccountIDCtrl: new FormControl(e.airdropAccountID),
          airdropJobIDCtrl: new FormControl(e.airdropJobID),
          tagIDsCtrl: new FormControl(e.tagIDs),
        }));
      });

    this.airdropInteractionRecordService
      .queryCount(this.adjustQuery(removeEmpty(this.form.value)))
      .subscribe((count) => {
        this.total = count;
      });

  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // 支持正则查询
    const o: { [key: string]: any } = {
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