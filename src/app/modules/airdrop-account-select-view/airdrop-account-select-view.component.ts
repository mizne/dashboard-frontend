import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AirdropAccount, AirdropAccountService } from 'src/app/shared';


export const AIRDROP_ACCOUNT_SELECT_VIEW_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AirdropAccountSelectViewComponent),
  multi: true
};

interface TableItem extends AirdropAccount {
}

@Component({
  selector: 'airdrop-account-select-view',
  templateUrl: './airdrop-account-select-view.component.html',
  styles: [],
  providers: [AIRDROP_ACCOUNT_SELECT_VIEW_VALUE_ACCESSOR]
})
export class AirdropAccountSelectViewComponent implements ControlValueAccessor, OnDestroy {
  private onChange: Function | null = null;

  selectedAirdropAccount: TableItem | null = null;

  loadingAirdropAccount = false;

  constructor(
    private readonly airdropAccountService: AirdropAccountService,
    private readonly messageService: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NzNotificationService
  ) { }


  ngOnDestroy(): void { }

  writeValue(id: string): void {
    if (id) {
      this.loadingAirdropAccount = true;
      this.airdropAccountService.queryList({ _id: id })
        .subscribe({
          next: (items: AirdropAccount[]) => {
            this.loadingAirdropAccount = false;
            if (items.length > 0) {
              this.selectedAirdropAccount = {
                ...items[0],
              }
            } else {
              this.notificationService.warning(`获取 空投账号失败`, `没有找到, 也许被删除 id: ${id}`)
            }
          },
          error: (err: Error) => {
            this.loadingAirdropAccount = false;
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