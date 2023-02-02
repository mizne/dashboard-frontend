import { HttpClient } from '@angular/common/http';
import { Injectable, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Subject } from 'rxjs';
import {
  NotifyObserverNotAllowService,
  NotifyObserverNotAllow,
  NotifyObserverTypes,
} from 'src/app/shared';
import { isNil } from 'src/app/utils';
import { CreateNotifyObserverNotAllowComponent } from './components/create-notify-observer-not-allow.component';

export enum NotifyObserverNotAllowModalActions {
  CREATE = 'create',
  UPDATE = 'update',
}

@Injectable()
export class CreateNotifyObserverNotAllowService {
  constructor(
    private modal: NzModalService,
    private notifyObserverNotAllowService: NotifyObserverNotAllowService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  // 1. 成功 -> 结束
  // 2. 失败 -> 失败 -> 结束
  // 3. 失败 -> 失败 -> 成功 -> 结束
  createModal(
    title: string,
    obj: Partial<NotifyObserverNotAllow>,
    viewContainerRef: ViewContainerRef,
    action: NotifyObserverNotAllowModalActions = NotifyObserverNotAllowModalActions.CREATE
  ): {
    modal: NzModalRef<any>;
    success: Observable<any>;
    error: Observable<Error>;
  } {
    const form = this.fb.group({
      type: [obj.type || this.resolveDefaultType(), [Validators.required]],

      url: [obj.url],
    });
    // 创建成功时 会next值 弹框会关闭 且会结束
    const successSubject = new Subject<any>();

    // 创建失败时 会next Error 弹框不会关闭且不会结束 只有弹框被取消时才会结束
    const errorSubject = new Subject<Error>();
    const modal = this.modal.create({
      nzTitle: title,
      nzWidth: 666,
      nzContent: CreateNotifyObserverNotAllowComponent,
      nzViewContainerRef: viewContainerRef,
      nzComponentParams: {
        form: form,
      },
      nzOnOk: () => {
        return action === NotifyObserverNotAllowModalActions.CREATE
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

  private async createItem(
    form: FormGroup,
    errorSub: Subject<Error>
  ): Promise<any> {
    if (form.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    const valid = await this.checkValidForm(form);
    if (valid.code !== 0) {
      errorSub.next(new Error(valid.message));
      return Promise.resolve(false);
    }

    const existed = await this.checkExisted(form, errorSub);
    if (existed) {
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      this.notifyObserverNotAllowService.create(form.value).subscribe({
        next: (v) => {
          if (v.code === 0) {
            this.updateDefaultType(form.value.type)
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

  private async updateItem(
    id: string | undefined,
    form: FormGroup,
    errorSub: Subject<Error>
  ): Promise<any> {
    if (form.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    const valid = await this.checkValidForm(form);
    if (valid.code !== 0) {
      errorSub.next(new Error(valid.message));
      return Promise.resolve(false);
    }

    const existed = await this.checkExisted(form, errorSub, id);
    if (existed) {
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      this.notifyObserverNotAllowService.update(id, form.value).subscribe({
        next: (v) => {
          if (v.code === 0) {
            this.updateDefaultType(form.value.type)
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

  private checkExisted(form: FormGroup, errorSub: Subject<Error>, id?: string): Promise<boolean> {
    const condition = this.resolveExistedCondition(form);
    if (!condition) {
      return Promise.resolve(false)
    }

    return new Promise((resolve, reject) => {
      this.notifyObserverNotAllowService.queryList(condition).subscribe({
        next: (results) => {
          if (id) {
            const theOther = results.find(e => e._id !== id);
            if (theOther) {
              errorSub.next(new Error('相同通知源已存在'));
              resolve(true)
            } else {
              resolve(false)
            }
          } else {
            if (results.length > 0) {
              errorSub.next(new Error('相同通知源已存在'));
              resolve(true)
            } else {
              resolve(false)
            }
          }
        },
        error: (e) => {
          errorSub.next(new Error('查询是否有相同通知源失败'));
          resolve(true);
        },
      });
    });
  }

  private checkValidForm(form: FormGroup): { code: number; message?: string } {
    switch (form.value.type) {
      case NotifyObserverTypes.QUEST3:
        return form.value.url ? { code: 0 } : { code: -1, message: `没有填写quest3主页链接` }
      case NotifyObserverTypes.GALXE:
        return form.value.url ? { code: 0 } : { code: -1, message: `没有填写galxe主页链接` }
      default:
        this.message.warning(`未知类型 ${form.value.type}`)
        return { code: 0 }
    }
  }

  private resolveExistedCondition(form: FormGroup): Partial<NotifyObserverNotAllow> | null {
    switch (form.value.type) {
      case NotifyObserverTypes.QUEST3:
        return form.value.url ? { type: NotifyObserverTypes.QUEST3, url: form.value.url } : null
      case NotifyObserverTypes.GALXE:
        return form.value.url ? { type: NotifyObserverTypes.GALXE, url: form.value.url } : null

      default:
        this.message.warning(`未知类型 ${form.value.type}`)
        return null
    }
  }

  private resolveDefaultType(): NotifyObserverTypes {
    const lastType = localStorage.getItem('CREATE_NOTIFY_OBSERVER_NOT_ALLOW_DEFAULT_TYPE') as NotifyObserverTypes
    return lastType || NotifyObserverTypes.MEDIUM
  }

  private updateDefaultType(type: NotifyObserverTypes) {
    localStorage.setItem('CREATE_NOTIFY_OBSERVER_NOT_ALLOW_DEFAULT_TYPE', type)
  }
}
