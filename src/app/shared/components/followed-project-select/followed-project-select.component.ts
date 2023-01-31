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
import { FollowedProject, Tag } from '../../models';
import { FollowedProjectService } from '../../services';
import { environment } from 'src/environments/environment';
import { removeEmpty } from 'src/app/utils';


export const FOLLOWED_PROJECT_SELECT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FollowedProjectSelectComponent),
  multi: true
};

interface TableItem extends FollowedProject {
  tagIDsCtrl: FormControl;
}

@Component({
  selector: 'followed-project-select',
  templateUrl: './followed-project-select.component.html',
  styles: [],
  providers: [FOLLOWED_PROJECT_SELECT_VALUE_ACCESSOR]
})
export class FollowedProjectSelectComponent implements ControlValueAccessor, OnDestroy {
  private onChange: Function | null = null;

  selectedFollowedProject: TableItem | null = null;
  selectModalVisible = false;
  logoBasePath = environment.imageBaseURL;

  total = 1;
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
    tagIDs: [null],
  });

  constructor(
    private readonly followedProjectService: FollowedProjectService,
    private readonly messageService: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NzNotificationService
  ) { }

  showSelectModal(): void {
    this.selectModalVisible = true;
    this.loadDataFromServer();
  }

  projectDetailHref(id: string): string {
    return `${location.protocol}//${location.host}/followed-project/detail/${id}`;
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
    this.selectedFollowedProject = null;
    this.emitValue();
  }

  confirmSelect(item: TableItem) {
    this.selectedFollowedProject = item;
    this.selectModalVisible = false;
    this.emitValue();
  }

  private loadDataFromServer(): void {
    this.query = removeEmpty(this.form.value);
    this.loading = true;
    this.followedProjectService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results.map((e) => ({
          ...e,
          tagIDsCtrl: new FormControl(e.tagIDs),
        }));
      });

    this.followedProjectService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // name website 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'name') {
        Object.assign(o, {
          ['name']: {
            $regex: query['name'],
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
    // console.log(`emitValue() selectedFollowedProject: `, this.selectedFollowedProject)
    if (this.onChange) {
      this.onChange(this.selectedFollowedProject ? this.selectedFollowedProject._id : '')
    }
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
              this.notificationService.warning(`获取 关注项目失败`, `没有找到 关注项目, id: ${id}`)
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