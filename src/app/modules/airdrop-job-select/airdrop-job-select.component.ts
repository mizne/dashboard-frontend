import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  Input,
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/environment';
import { removeEmpty } from 'src/app/utils';
import { AirdropJob, AirdropJobService } from 'src/app/shared';


export const AIRDROP_JOB_SELECT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AirdropJobSelectComponent),
  multi: true
};

interface TableItem extends AirdropJob {
}

@Component({
  selector: 'airdrop-job-select',
  templateUrl: './airdrop-job-select.component.html',
  styles: [],
  providers: [AIRDROP_JOB_SELECT_VALUE_ACCESSOR]
})
export class AirdropJobSelectComponent implements ControlValueAccessor, OnDestroy {
  private onChange: Function | null = null;

  @Input() mode: 'simple' | 'default' = 'default'

  selectedAirdropJob: TableItem | null = null;
  selectModalVisible = false;

  total = 0;
  items: TableItem[] = [];
  loading = true;
  pageSize = 12;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    title: [null],
  });

  constructor(
    private readonly airdropJobService: AirdropJobService,
    private readonly messageService: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NzNotificationService
  ) { }

  showSelectModal(): void {
    this.selectModalVisible = true;
    this.loadDataFromServer();
  }

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

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }

  confirmDeSelect() {
    this.selectedAirdropJob = null;
    this.emitValue();
  }

  confirmSelect(item: TableItem) {
    this.selectedAirdropJob = item;
    this.selectModalVisible = false;
    this.emitValue();
  }

  private loadDataFromServer(): void {
    this.query = removeEmpty(this.form.value);
    this.loading = true;
    this.airdropJobService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map((e) => ({
          ...e,
        }));
      });

    this.airdropJobService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'title') {
        Object.assign(o, {
          ['title']: {
            $regex: query['title'].trim(),
            $options: 'i',
          },
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }


  emitValue() {
    // console.log(`emitValue() selectedAirdropJob: `, this.selectedAirdropJob)
    if (this.onChange) {
      this.onChange(this.selectedAirdropJob ? this.selectedAirdropJob._id : null)
    }
  }

  ngOnDestroy(): void { }

  writeValue(id: string): void {
    if (id) {
      this.airdropJobService.queryList({ _id: id })
        .subscribe({
          next: (items: AirdropJob[]) => {
            if (items.length > 0) {
              this.selectedAirdropJob = {
                ...items[0],
              }
            } else {
              this.notificationService.warning(`获取 空投任务失败`, `没有找到, 也许被删除 id: ${id}`)
            }
          },
          error: (err: Error) => {
            this.notificationService.error(`获取 空投任务失败`, `${err.message}, id: ${id}`)
          }
        })
    } else {
      this.selectedAirdropJob = null;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    // noop
  }
  setDisabledState?(isDisabled: boolean): void {
    // noop
  }
}