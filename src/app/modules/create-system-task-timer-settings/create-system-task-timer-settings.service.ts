import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Subject } from 'rxjs';
import { SystemTaskTimerSettingsService, SystemTaskTimerSettings, SharedService } from 'src/app/shared';
import { isNil } from 'src/app/utils';
import { CreateSystemTaskTimerSettingsComponent } from './components/create-system-task-timer-settings.component';

export enum SystemTaskTimerSettingsModalActions {
  CREATE = 'create',
  UPDATE = 'update',
}

@Injectable()
export class CreateSystemTaskTimerSettingsService {
  constructor(
    private modal: NzModalService,
    private systemTaskTimerSettingsService: SystemTaskTimerSettingsService,
    private sharedService: SharedService,
    private fb: FormBuilder
  ) { }

  // 1. 成功 -> 结束
  // 2. 失败 -> 失败 -> 结束
  // 3. 失败 -> 失败 -> 成功 -> 结束
  createModal(
    title: string,
    obj: Partial<SystemTaskTimerSettings>,
    action: SystemTaskTimerSettingsModalActions = SystemTaskTimerSettingsModalActions.CREATE
  ): {
    modal: NzModalRef<any>;
    success: Observable<any>;
    error: Observable<Error>;
  } {
    const form = this.fb.group({
      // type: [obj.type, [Validators.required]],
      timerHour: [obj.timerHour],
      timerMinute: [obj.timerMinute],
      timerDate: [obj.timerDate],
      timerMonth: [obj.timerMonth],
      timerDayOfWeek: [obj.timerDayOfWeek],
    });
    // 创建成功时 会next值 弹框会关闭 且会结束
    const successSubject = new Subject<any>();

    // 创建失败时 会next Error 弹框不会关闭且不会结束 只有弹框被取消时才会结束
    const errorSubject = new Subject<Error>();
    const modal = this.modal.create({
      nzTitle: title,
      nzContent: CreateSystemTaskTimerSettingsComponent,
      nzViewContainerRef: this.sharedService.getAppViewContainerRef(),
      nzComponentParams: {
        form: form,
      },
      nzOnOk: () => {
        return action === SystemTaskTimerSettingsModalActions.CREATE
          ? this.createItem(form, errorSubject)
          : this.updateItem(obj._id, form, errorSubject);
      },
    });

    modal.afterClose.subscribe((res) => {
      if (isNil(res)) {
        // errorSubject.next(new Error('用户取消'));
        errorSubject.complete();
        successSubject.complete();
      } else {
        successSubject.next(res);
        successSubject.complete();
        errorSubject.complete();
      }
    });

    return {
      modal,
      success: successSubject.asObservable(),
      error: errorSubject.asObservable(),
    };
  }

  private createItem(
    form: FormGroup,
    errorSub: Subject<Error>
  ): Promise<any> {
    const timerHour = form.get('timerHour')?.value as number[];
    const timerMinute = form.get('timerMinute')?.value as number[];

    if (timerHour.length === 0 || timerMinute.length === 0) {
      errorSub.next(new Error('hour minute必填'));
      return Promise.resolve(false);
    }

    if (form.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      // 这里写 新增接口
      this.systemTaskTimerSettingsService.create({
        ...form.value,
      }).subscribe({
        next: (v) => {
          if (v.code === 0) {
            resolve(v.result || '添加成功');
          } else {
            errorSub.next(new Error(v.message));
            resolve(false);
          }
        },
        error: (e) => {
          errorSub.next(new Error(e.message));
          resolve(false);
        },
      });
    });
  }

  private updateItem(
    id: string | undefined,
    form: FormGroup,
    errorSub: Subject<Error>
  ): Promise<any> {
    const timerHour = form.get('timerHour')?.value as number[];
    const timerMinute = form.get('timerMinute')?.value as number[];

    if (timerHour.length === 0 || timerMinute.length === 0) {
      errorSub.next(new Error('hour minute必填'));
      return Promise.resolve(false);
    }
    if (form.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      // 这里写 修改接口

      this.systemTaskTimerSettingsService.update(id, {
        ...form.value,
      }).subscribe({
        next: (v) => {
          if (v.code === 0) {
            resolve(v.result || '修改成功');
          } else {
            errorSub.next(new Error(v.message));
            resolve(false);
          }
        },
        error: (e) => {
          errorSub.next(new Error(e.message));
          resolve(false);
        },
      });
    });
  }
}
