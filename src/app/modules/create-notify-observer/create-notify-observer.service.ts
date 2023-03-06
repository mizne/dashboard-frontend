import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Subject } from 'rxjs';
import {
  NotifyObserverService,
  NotifyObserver,
  SharedService,
  FollowedProjectService,
} from 'src/app/shared';
import { isNil } from 'src/app/utils';
import { CreateNotifyObserverComponent } from './components/create-notify-observer.component';
import { NotifyObserverModalActions } from './create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from './notify-observer-type-manager.service';



@Injectable()
export class CreateNotifyObserverService {
  constructor(
    private modal: NzModalService,
    private notifyObserverService: NotifyObserverService,
    private followedProjectService: FollowedProjectService,
    private sharedService: SharedService,
    private notifyObserverTypeService: NotifyObserverTypeManagerService,
  ) { }

  private modalInstance: NzModalRef<CreateNotifyObserverComponent> | null = null;

  // 1. 成功 -> 结束
  // 2. 失败 -> 失败 -> 结束
  // 3. 失败 -> 失败 -> 成功 -> 结束
  createModal(
    title: string,
    obj: Partial<NotifyObserver>,
    action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE
  ): {
    modal: NzModalRef<any>;
    success: Observable<any>;
    error: Observable<Error>;
  } {
    const baseForm = this.notifyObserverTypeService.createBaseForm(obj);
    const secondForm = this.notifyObserverTypeService.createSecondForm(baseForm.get('type')?.value, obj, action)
    // 创建成功时 会next值 弹框会关闭 且会结束
    const successSubject = new Subject<any>();

    // 创建失败时 会next Error 弹框不会关闭且不会结束 只有弹框被取消时才会结束
    const errorSubject = new Subject<Error>();

    const modal = this.modal.create({
      nzTitle: title,
      nzWidth: 666,
      nzContent: CreateNotifyObserverComponent,
      nzViewContainerRef: this.sharedService.getAppViewContainerRef(),
      nzComponentParams: {
        baseForm: baseForm,
        secondForm,
        notifyObserverInstance: obj,
        action,
        disabledType: action === NotifyObserverModalActions.UPDATE
      },
      nzOnOk: () => {
        return action === NotifyObserverModalActions.CREATE
          ? this.createNotifyObserver(errorSubject)
          : this.updateNotifyObserver(obj._id, errorSubject);
      },
    });

    this.modalInstance = modal;

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

  private async createNotifyObserver(
    errorSub: Subject<Error>
  ): Promise<any> {
    const baseForm = this.modalInstance?.getContentComponent().baseForm as FormGroup;
    const secondForm = this.modalInstance?.getContentComponent().secondForm as FormGroup;
    if (baseForm.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    const obj = {
      ...baseForm.value,
      ...secondForm.value,
    }

    const valid = await this.notifyObserverTypeService.checkValidForm(obj);
    if (valid.code !== 0) {
      errorSub.next(new Error(valid.message));
      return Promise.resolve(false);
    }

    const existed = await this.checkExisted(obj, errorSub);
    if (existed) {
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {

      this.fetchFollowedProjectLogo(obj.followedProjectID)
        .then(logo => {
          this.notifyObserverService.create({
            ...obj,
            followedProjectLogo: logo
          }).subscribe({
            next: (v) => {
              if (v.code === 0) {
                this.notifyObserverTypeService.updateDefaultType(obj.type)
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
        })



    });
  }

  private async updateNotifyObserver(
    id: string | undefined,
    errorSub: Subject<Error>
  ): Promise<any> {
    const baseForm = this.modalInstance?.getContentComponent().baseForm as FormGroup;
    const secondForm = this.modalInstance?.getContentComponent().secondForm as FormGroup;
    if (baseForm.invalid) {
      errorSub.next(new Error('请检查表单非法字段'));
      return Promise.resolve(false);
    }

    const obj = {
      ...baseForm.value,
      ...secondForm.value,
    }

    const valid = await this.notifyObserverTypeService.checkValidForm(obj);
    if (valid.code !== 0) {
      errorSub.next(new Error(valid.message));
      return Promise.resolve(false);
    }

    const existed = await this.checkExisted(obj, errorSub, id);
    if (existed) {
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      this.fetchFollowedProjectLogo(obj.followedProjectID)
        .then(logo => {
          this.notifyObserverService.update(id, {
            ...obj,
            followedProjectLogo: logo
          }).subscribe({
            next: (v) => {
              if (v.code === 0) {
                this.notifyObserverTypeService.updateDefaultType(obj.type)
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
        })


    });
  }

  private checkExisted(obj: Partial<NotifyObserver>, errorSub: Subject<Error>, id?: string): Promise<boolean> {
    const condition = this.notifyObserverTypeService.resolveExistedCondition(obj);
    if (!condition) {
      return Promise.resolve(false)
    }

    return new Promise((resolve, reject) => {
      this.notifyObserverService.queryList(condition).subscribe({
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



  private async fetchFollowedProjectLogo(id: string): Promise<string> {
    if (!id) {
      return ''
    }
    return new Promise((resolve, reject) => {
      // 这里写 更新接口
      this.followedProjectService.queryList({ _id: id }).subscribe({
        next: (v) => {
          if (v.length > 0) {
            resolve(v[0].logo || '');
          } else {
            resolve('');
          }
        },
        error: (e) => {
          resolve('');
        },
      });
    });
  }
}
