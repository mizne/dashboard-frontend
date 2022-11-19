import { HttpClient } from '@angular/common/http';
import { Injectable, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Subject } from 'rxjs';
import {
  NotifyObserverService,
  NotifyObserver,
  NotifyObserverTypes,
} from 'src/app/shared';
import { isNil } from 'src/app/utils';
import { CreateNotifyObserverComponent } from './components/create-notify-observer.component';

export enum NotifyObserverModalActions {
  CREATE = 'create',
  UPDATE = 'update',
}

@Injectable()
export class CreateNotifyObserverService {
  constructor(
    private modal: NzModalService,
    private notifyObserverService: NotifyObserverService,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  // 1. 成功 -> 结束
  // 2. 失败 -> 失败 -> 结束
  // 3. 失败 -> 失败 -> 成功 -> 结束
  createModal(
    title: string,
    obj: Partial<NotifyObserver>,
    viewContainerRef: ViewContainerRef,
    action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE
  ): {
    modal: NzModalRef<any>;
    success: Observable<any>;
    error: Observable<Error>;
  } {
    const form = this.fb.group({
      type: [obj.type || NotifyObserverTypes.MEDIUM, [Validators.required]],
      enableTracking: [
        obj.enableTracking === false ? false : true,
        [Validators.required],
      ],
      notifyShowTitle: [obj.notifyShowTitle],
      mediumHomeLink: [obj.mediumHomeLink],
      mediumTitleKey: [obj.mediumTitleKey],
      mirrorHomeLink: [obj.mirrorHomeLink],
      mirrorTitleKey: [obj.mirrorTitleKey],
      twitterHomeLink: [obj.twitterHomeLink],
      twitterTitleKey: [obj.twitterTitleKey],
      twitterWithReply: [!!obj.twitterWithReply],
      twitterWithLike: [!!obj.twitterWithLike],
      twitterSpaceHomeLink: [obj.twitterSpaceHomeLink],
      twitterSpaceTitleKey: [obj.twitterSpaceTitleKey],
      quest3HomeLink: [obj.quest3HomeLink],
      quest3TitleKey: [obj.quest3TitleKey],
      galxeHomeLink: [obj.galxeHomeLink],
      galxeTitleKey: [obj.galxeTitleKey],
    });
    // 创建成功时 会next值 弹框会关闭 且会结束
    const successSubject = new Subject<any>();

    // 创建失败时 会next Error 弹框不会关闭且不会结束 只有弹框被取消时才会结束
    const errorSubject = new Subject<Error>();
    const modal = this.modal.create({
      nzTitle: title,
      nzWidth: 666,
      nzContent: CreateNotifyObserverComponent,
      nzViewContainerRef: viewContainerRef,
      nzComponentParams: {
        form: form,
      },
      nzOnOk: () => {
        return action === NotifyObserverModalActions.CREATE
          ? this.createNotifyObserver(form, errorSubject)
          : this.updateNotifyObserver(obj._id, form, errorSubject);
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

  private createNotifyObserver(
    form: FormGroup,
    errorSub: Subject<Error>
  ): Promise<any> {
    if (form.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      // 这里写 新增project接口
      this.notifyObserverService.create(form.value).subscribe({
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

  private updateNotifyObserver(
    id: string | undefined,
    form: FormGroup,
    errorSub: Subject<Error>
  ): Promise<any> {
    if (form.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      // 这里写 新增project接口
      this.notifyObserverService.update(id, form.value).subscribe({
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
