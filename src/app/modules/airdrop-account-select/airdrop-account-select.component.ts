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
import { AirdropAccount, AirdropAccountService } from 'src/app/shared';


export const AIRDROP_ACCOUNT_SELECT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AirdropAccountSelectComponent),
  multi: true
};

interface TableItem extends AirdropAccount {
}

@Component({
  selector: 'airdrop-account-select',
  templateUrl: './airdrop-account-select.component.html',
  styles: [],
  providers: [AIRDROP_ACCOUNT_SELECT_VALUE_ACCESSOR]
})
export class AirdropAccountSelectComponent implements ControlValueAccessor, OnDestroy {
  private onChange: Function | null = null;

  @Input() mode: 'simple' | 'default' = 'default'

  selectedAirdropAccount: TableItem | null = null;
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
    name: [null],
  });

  constructor(
    private readonly airdropAccountService: AirdropAccountService,
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
    this.selectedAirdropAccount = null;
    this.emitValue();
  }

  confirmSelect(item: TableItem) {
    this.selectedAirdropAccount = item;
    this.selectModalVisible = false;
    this.emitValue();
  }

  private loadDataFromServer(): void {
    this.query = removeEmpty(this.form.value);
    this.loading = true;
    this.airdropAccountService
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

    this.airdropAccountService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'name') {
        Object.assign(o, {
          ['name']: {
            $regex: query['name'].trim(),
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
    // console.log(`emitValue() selectedAirdropAccount: `, this.selectedAirdropAccount)
    if (this.onChange) {
      this.onChange(this.selectedAirdropAccount ? this.selectedAirdropAccount._id : null)
    }
  }

  ngOnDestroy(): void { }

  writeValue(id: string): void {
    if (id) {
      this.airdropAccountService.queryList({ _id: id })
        .subscribe({
          next: (items: AirdropAccount[]) => {
            if (items.length > 0) {
              this.selectedAirdropAccount = {
                ...items[0],
              }
            } else {
              this.notificationService.warning(`获取 空投账号失败`, `没有找到, 也许被删除 id: ${id}`)
            }
          },
          error: (err: Error) => {
            this.notificationService.error(`获取 空投账号失败`, `${err.message}, id: ${id}`)
          }
        })
    } else {
      this.selectedAirdropAccount = null;
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