import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, Subject } from 'rxjs';
import {
  NotifyObserverService,
  NotifyObserver,
  SharedService,
  FollowedProjectService,
  NotifyObserverTypes,
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
    private notifyObserverTypeManagerService: NotifyObserverTypeManagerService,
    private readonly nzNotificationService: NzNotificationService,
    private message: NzMessageService,
  ) { }

  private modalInstance: NzModalRef<CreateNotifyObserverComponent> | null = null;

  // 根据link3活动主页url 添加link3活动通知源
  createLink3ActivityModal(link3URL: string, followedProjectID?: string): {
    success: Observable<any>;
    error: Observable<Error>;
  } {
    // 添加活动通知源成功
    const successSubject = new Subject<any>();
    // 添加活动通知源失败
    const errorSubject = new Subject<Error>();

    const id = this.message.loading('获取Link3活动详情...', { nzDuration: 0 }).messageId;

    this.sharedService.fetchLink3ActivityDetail(link3URL)
      .subscribe({
        next: (v) => {
          this.message.remove(id);
          if (v.code === 0) {
            this.checkLink3ActivityExisted(v.result, successSubject, errorSubject, followedProjectID);
          } else {
            this.nzNotificationService.error(`获取Link3活动详情 失败`, `${v.message}`);
            errorSubject.next(new Error(`获取Link3活动详情 失败 ${v.message}`));
            errorSubject.complete();
            successSubject.complete();
          }
        },
        error: (err) => {
          this.message.remove(id);
          this.nzNotificationService.error(`获取Link3活动详情 失败`, `${err.message}`);
          errorSubject.next(new Error(`获取Link3活动详情 失败 ${err.message}`));
          errorSubject.complete();
          successSubject.complete();
        }
      })
    return {
      success: successSubject.asObservable(),
      error: errorSubject.asObservable(),
    }
  }

  private checkLink3ActivityExisted(activity: any, successSub: Subject<void>, errorSub: Subject<Error>, followedProjectID?: string) {
    // 先查询是否已添加过该活动 
    // 如添加过 则修改原来的通知源（因为原来通知源的时间 详情可能已被更新）
    // 如未添加过 则直接添加

    this.notifyObserverService.queryList({
      enableTracking: true,
      type: NotifyObserverTypes.TIMER,
      timerOnce: true,
      timerNotifyShowUrl: activity.url
    })
      .subscribe({
        next: (items: NotifyObserver[]) => {
          if (items.length > 0) {
            if (this.isSame(activity, items[0])) {
              this.nzNotificationService.warning(`相同 Link3活动 已存在`, `相同 Link3活动 已存在`);
              successSub.complete();
              errorSub.complete();
            } else {
              const ref = this.message.loading('Link3活动已存在，准备更新最新活动信息', { nzDuration: 4e3 });
              ref.onClose.subscribe(() => {
                this.ensureUpdateTimerNotifyObserver(activity, items[0], successSub, errorSub, followedProjectID)
              })
            }
          } else {
            this.ensureCreateTimerNotifyObserver(activity, successSub, errorSub, followedProjectID)
          }
        },
        error: (err: Error) => {
          this.nzNotificationService.error(`检查相似 Link3活动 失败`, `检查相似 Link3活动 失败`);
          this.ensureCreateTimerNotifyObserver(activity, successSub, errorSub, followedProjectID)
        }
      })
  }

  private isSame(activity: any, item: NotifyObserver): boolean {
    const sameTitle = `${activity.organizerHandle} - Link3 | ${activity.title}` === item.notifyShowTitle;
    const sameHour = !!item.timerHour && (new Date(activity.startTime).getHours() === item.timerHour[0])
    const sameMinute = !!item.timerMinute && (new Date(activity.startTime).getMinutes() === item.timerMinute[0])
    const sameDate = !!item.timerDate && (new Date(activity.startTime).getDate() === item.timerDate[0])
    const sameMonth = !!item.timerMonth && ((new Date(activity.startTime).getMonth() + 1) === item.timerMonth[0])
    const sameDesc = activity.rewardInfo === item.timerNotifyShowDesc

    return sameTitle && sameHour && sameMinute && sameDate && sameMonth && sameDesc
  }

  private ensureCreateTimerNotifyObserver(activity: any, successSub: Subject<void>, errorSub: Subject<Error>, followedProjectID?: string) {
    const obj: Partial<NotifyObserver> = {
      enableTracking: true,
      type: NotifyObserverTypes.TIMER,
      timerOnce: true,

      notifyShowTitle: `${activity.organizerHandle} - Link3 | ${activity.title}`,
      timerHour: [new Date(activity.startTime).getHours()],
      timerMinute: [new Date(activity.startTime).getMinutes()],
      timerDate: [new Date(activity.startTime).getDate()],
      timerMonth: [new Date(activity.startTime).getMonth() + 1],
      timerNotifyShowDesc: activity.rewardInfo,
      timerNotifyShowUrl: activity.url,

      ...(followedProjectID ? { followedProjectID } : {})
    };
    const { success, error } = this.createModal(
      '添加Link3活动通知',
      obj,
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`添加Link3活动通知成功`, `添加Link3活动通知成功`);
      successSub.next();
      successSub.complete();
      errorSub.complete();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加Link3活动通知失败`, `${e.message}`);
      errorSub.next(new Error(`添加Link3活动通知失败 ${e.message}`));
      errorSub.complete();
      successSub.complete();
    });
  }

  private ensureUpdateTimerNotifyObserver(activity: any, item: NotifyObserver, successSub: Subject<void>, errorSub: Subject<Error>, followedProjectID?: string) {
    const obj: Partial<NotifyObserver> = {
      _id: item._id,
      enableTracking: true,
      type: NotifyObserverTypes.TIMER,
      timerOnce: true,

      notifyShowTitle: `${activity.organizerHandle} - Link3 | ${activity.title}`,
      timerHour: [new Date(activity.startTime).getHours()],
      timerMinute: [new Date(activity.startTime).getMinutes()],
      timerDate: [new Date(activity.startTime).getDate()],
      timerMonth: [new Date(activity.startTime).getMonth() + 1],
      timerNotifyShowDesc: activity.rewardInfo,
      timerNotifyShowUrl: activity.url,

      ...(followedProjectID ? { followedProjectID } : {})
    };
    const { success, error } = this.createModal(
      '修改Link3活动通知',
      obj,
      NotifyObserverModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(`修改Link3活动通知成功`, `修改Link3活动通知成功`);
      successSub.next();
      successSub.complete();
      errorSub.complete();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`修改Link3活动通知失败`, `${e.message}`);
      errorSub.next(new Error(`修改Link3活动通知失败 ${e.message}`));
      errorSub.complete();
      successSub.complete();
    });
  }

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
    const baseForm = this.notifyObserverTypeManagerService.createBaseForm(obj);
    const secondForm = this.notifyObserverTypeManagerService.createSecondForm(baseForm.get('type')?.value, obj, action)
    // 创建成功时 会next值 弹框会关闭 且会结束
    const successSubject = new Subject<any>();

    // 创建失败时 会next Error 弹框不会关闭且不会结束 只有弹框被取消时才会结束
    const errorSubject = new Subject<Error>();

    const modal = this.modal.create({
      nzTitle: title,
      nzWidth: 1000,
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

    const valid = await this.notifyObserverTypeManagerService.checkValidForm(obj);
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
                this.notifyObserverTypeManagerService.updateDefaultType(obj.type)
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

    const valid = await this.notifyObserverTypeManagerService.checkValidForm(obj);
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
                this.notifyObserverTypeManagerService.updateDefaultType(obj.type)
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
    const condition = this.notifyObserverTypeManagerService.resolveExistedCondition(obj);
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
