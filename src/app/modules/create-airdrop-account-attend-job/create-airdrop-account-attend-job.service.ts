import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Subject } from 'rxjs';
import { AirdropAccountAttendJobService, AirdropAccountAttendJob, SharedService } from 'src/app/shared';
import { isNil } from 'src/app/utils';
import { CreateAirdropAccountAttendJobComponent } from './components/create-airdrop-account-attend-job.component';

export enum AirdropAccountAttendJobModalActions {
  CREATE = 'create',
  UPDATE = 'update',
}

@Injectable()
export class CreateAirdropAccountAttendJobService {
  constructor(
    private modal: NzModalService,
    private airdropAccountAttendJobService: AirdropAccountAttendJobService,
    private fb: FormBuilder,
    private sharedService: SharedService
  ) { }

  // 1. 成功 -> 结束
  // 2. 失败 -> 失败 -> 结束
  // 3. 失败 -> 失败 -> 成功 -> 结束
  createModal(
    title: string,
    obj: Partial<AirdropAccountAttendJob>,
    action: AirdropAccountAttendJobModalActions = AirdropAccountAttendJobModalActions.CREATE
  ): {
    modal: NzModalRef<any>;
    success: Observable<any>;
    error: Observable<Error>;
  } {
    const form = this.fb.group({
      airdropAccountID: [obj.airdropAccountID, [Validators.required]],
      airdropJobID: [obj.airdropJobID, [Validators.required]],
      remark: [obj.remark],
    });
    // 创建成功时 会next值 弹框会关闭 且会结束
    const successSubject = new Subject<any>();

    // 创建失败时 会next Error 弹框不会关闭且不会结束 只有弹框被取消时才会结束
    const errorSubject = new Subject<Error>();
    const modal = this.modal.create({
      nzTitle: title,
      nzContent: CreateAirdropAccountAttendJobComponent,
      nzViewContainerRef: this.sharedService.getAppViewContainerRef(),
      nzComponentParams: {
        form: form,
      },
      nzOnOk: () => {
        return action === AirdropAccountAttendJobModalActions.CREATE
          ? this.createproject(form, errorSubject)
          : this.updateproject(obj._id, form, errorSubject);
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

  private createproject(
    form: FormGroup,
    errorSub: Subject<Error>
  ): Promise<any> {
    if (form.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      // 这里写 添加接口
      this.airdropAccountAttendJobService.create(form.value).subscribe({
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

  private updateproject(
    id: string | undefined,
    form: FormGroup,
    errorSub: Subject<Error>
  ): Promise<any> {
    if (form.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      // 这里写 修改接口
      this.airdropAccountAttendJobService.update(id, form.value).subscribe({
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
