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
import { NotifyObserver, NotifyObserverService } from 'src/app/shared';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NotifyObserverTypeManagerService } from 'src/app/modules/create-notify-observer';

export const NOTIFY_OBSERVER_MULTI_SELECT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NotifyObserverMultiSelectComponent),
  multi: true
};

@Component({
  selector: 'notify-observer-multi-select',
  templateUrl: './notify-observer-multi-select.component.html',
  styles: [],
  providers: [NOTIFY_OBSERVER_MULTI_SELECT_VALUE_ACCESSOR]
})
export class NotifyObserverMultiSelectComponent implements ControlValueAccessor, OnDestroy {
  private onChange: Function | null = null;

  notifyObservers: NotifyObserver[] = []
  selectModalVisible = false;

  total = 0;
  items: NotifyObserver[] = [];
  loading = true;
  pageSize = 12;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    notifyShowTitle: [null],
  });

  constructor(
    private readonly notifyObserverTypeService: NotifyObserverTypeManagerService,
    private readonly notifyObserverService: NotifyObserverService,
    private readonly messageService: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NzNotificationService
  ) { }

  showSelectModal(): void {
    this.selectModalVisible = true;
    this.loadDataFromServer();
  }

  drop(event: any) {
    moveItemInArray(this.notifyObservers, event.previousIndex, event.currentIndex);
    this.emitValue();
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

  resolveHref(item: NotifyObserver) {
    return this.notifyObserverTypeService.resolveHref(item)
  }

  resolveDesc(item: NotifyObserver) {
    return this.notifyObserverTypeService.resolveDesc(item)
  }

  pageIndexChange(index: number) {
    this.pageIndex = index;
    this.loadDataFromServer();
  }


  confirmSelect(item: NotifyObserver) {
    const index = this.notifyObservers.findIndex(e => e._id === item._id);
    if (index >= 0) {
      this.notificationService.warning(`已经选择过了`, `已经选择过了`)
      return
    }
    this.notifyObservers.push(item);
    this.selectModalVisible = false;
    this.emitValue();
  }

  confirmDeSelectItem(item: NotifyObserver) {
    this.notifyObservers = this.notifyObservers.filter(e => e._id !== item._id);
    this.emitValue();
  }

  private loadDataFromServer(): void {
    this.query = removeEmpty(this.form.value);
    this.loading = true;
    this.notifyObserverService
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

    this.notifyObserverService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // notifyShowTitle 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'notifyShowTitle') {
        Object.assign(o, {
          ['notifyShowTitle']: {
            $regex: query['notifyShowTitle'].trim(),
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
      this.onChange(this.notifyObservers.map(e => e._id))
    }
  }

  ngOnDestroy(): void { }

  writeValue(ids?: string[]): void {
    if (ids && ids.length > 0) {
      this.notifyObserverService.queryList({ _id: { $in: ids } } as any)
        .subscribe({
          next: (items: NotifyObserver[]) => {
            if (items.length > 0) {
              this.notifyObservers = ids.map(id => {
                const the = items.find(e => e._id === id);
                return the || null
              }).filter(e => !!e) as Array<NotifyObserver>;
              if (ids.length !== items.length) {
                this.notificationService.warning(`也许有通知源被删除`, `也许有通知源被删除`)
              }
            } else {
              this.notifyObservers = []
              this.notificationService.warning(`获取 通知源失败`, `没有找到, 也许被删除`)
            }
          },
          error: (err: Error) => {
            this.notificationService.error(`获取 通知源失败`, `${err.message}`)
          }
        })
    } else {
      this.notifyObservers = [];
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