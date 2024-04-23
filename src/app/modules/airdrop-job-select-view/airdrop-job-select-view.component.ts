import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AirdropJob, AirdropJobService } from 'src/app/shared';


export const AIRDROP_JOB_SELECT_VIEW_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AirdropJobSelectViewComponent),
  multi: true
};

interface TableItem extends AirdropJob {
}

@Component({
  selector: 'airdrop-job-select-view',
  templateUrl: './airdrop-job-select-view.component.html',
  styles: [],
  providers: [AIRDROP_JOB_SELECT_VIEW_VALUE_ACCESSOR]
})
export class AirdropJobSelectViewComponent implements ControlValueAccessor, OnDestroy {
  private onChange: Function | null = null;

  selectedAirdropJob: TableItem | null = null;

  loadingAirdropJob = false;

  constructor(
    private readonly airdropJobService: AirdropJobService,
    private readonly messageService: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NzNotificationService
  ) { }


  ngOnDestroy(): void { }

  writeValue(id: string): void {
    if (id) {
      this.loadingAirdropJob = true;
      this.airdropJobService.queryList({ _id: id })
        .subscribe({
          next: (items: AirdropJob[]) => {
            this.loadingAirdropJob = false;
            if (items.length > 0) {
              this.selectedAirdropJob = {
                ...items[0],
              }
            } else {
              this.notificationService.warning(`获取 空投任务失败`, `没有找到, 也许被删除 id: ${id}`)
            }
          },
          error: (err: Error) => {
            this.loadingAirdropJob = false;
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