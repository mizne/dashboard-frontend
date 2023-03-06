import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FollowedProject, FollowedProjectService } from 'src/app/shared';


export const FOLLOWED_PROJECT_SELECT_VIEW_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FollowedProjectSelectViewComponent),
  multi: true
};

interface TableItem extends FollowedProject {
  tagIDsCtrl: FormControl;
}

@Component({
  selector: 'followed-project-select-view',
  templateUrl: './followed-project-select-view.component.html',
  styles: [],
  providers: [FOLLOWED_PROJECT_SELECT_VIEW_VALUE_ACCESSOR]
})
export class FollowedProjectSelectViewComponent implements ControlValueAccessor, OnDestroy {
  private onChange: Function | null = null;

  selectedFollowedProject: TableItem | null = null;

  constructor(
    private readonly followedProjectService: FollowedProjectService,
    private readonly messageService: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NzNotificationService
  ) { }


  projectDetailHref(id: string): string {
    return `${location.protocol}//${location.host}/followed-project/detail/${id}`;
  }

  ngOnDestroy(): void { }

  writeValue(id: string): void {
    if (id) {
      this.followedProjectService.queryList({ _id: id })
        .subscribe({
          next: (items: FollowedProject[]) => {
            if (items.length > 0) {
              this.selectedFollowedProject = {
                ...items[0],
                tagIDsCtrl: new FormControl(items[0].tagIDs),
              }
            } else {
              this.notificationService.warning(`获取 关注项目失败`, `没有找到, 也许被删除 id: ${id}`)
            }
          },
          error: (err: Error) => {
            this.notificationService.error(`获取 关注项目失败`, `${err.message}, id: ${id}`)
          }
        })
    } else {
      this.selectedFollowedProject = null;
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