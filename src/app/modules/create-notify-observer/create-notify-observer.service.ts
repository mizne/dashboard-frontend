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
      type: [obj.type || this.resolveDefaultType(), [Validators.required]],
      enableTracking: [
        obj.enableTracking === false ? false : true,
        [Validators.required],
      ],
      followedProjectID: [obj.followedProjectID],
      notifyShowTitle: [obj.notifyShowTitle],

      mediumHomeLink: [obj.mediumHomeLink],
      mediumTitleKey: [obj.mediumTitleKey],

      mirrorHomeLink: [obj.mirrorHomeLink],
      mirrorTitleKey: [obj.mirrorTitleKey],

      twitterHomeLink: [obj.twitterHomeLink],
      twitterTitleKey: [obj.twitterTitleKey],
      twitterTitleKeyWithDefault: [!!obj.twitterTitleKeyWithDefault],
      twitterWithReply: [action === NotifyObserverModalActions.CREATE ? true : !!obj.twitterWithReply],
      twitterWithLike: [!!obj.twitterWithLike],
      twitterWithFollowingsChange: [!!obj.twitterWithFollowingsChange],

      twitterSpaceHomeLink: [obj.twitterSpaceHomeLink],
      twitterSpaceTitleKey: [obj.twitterSpaceTitleKey],

      quest3HomeLink: [obj.quest3HomeLink],
      quest3TitleKey: [obj.quest3TitleKey],

      galxeHomeLink: [obj.galxeHomeLink],
      galxeTitleKey: [obj.galxeTitleKey],

      snapshotHomeLink: [obj.snapshotHomeLink],
      snapshotTitleKey: [obj.snapshotTitleKey],

      guildHomeLink: [obj.guildHomeLink],
      guildTitleKey: [obj.guildTitleKey],

      xiaoyuzhouHomeLink: [obj.xiaoyuzhouHomeLink],
      xiaoyuzhouTitleKey: [obj.xiaoyuzhouTitleKey],

      timerHour: [obj.timerHour],
      timerMinute: [obj.timerMinute],
      timerDate: [obj.timerDate],
      timerMonth: [obj.timerMonth],
      timerNotifyShowDesc: [obj.timerNotifyShowDesc],
      timerNotifyShowUrl: [obj.timerNotifyShowUrl],
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
        disabledType: action === NotifyObserverModalActions.UPDATE
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

  private async createNotifyObserver(
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
      this.notifyObserverService.create(form.value).subscribe({
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

  private async updateNotifyObserver(
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
      this.notifyObserverService.update(id, form.value).subscribe({
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
      this.notifyObserverService.queryList(condition).subscribe({
        next: (results) => {
          if (id) {
            const theOther = results.find(e => e._id !== id);
            if (theOther) {
              errorSub.next(new Error('相同订阅源已存在'));
              resolve(true)
            } else {
              resolve(false)
            }
          } else {
            if (results.length > 0) {
              errorSub.next(new Error('相同订阅源已存在'));
              resolve(true)
            } else {
              resolve(false)
            }
          }
        },
        error: (e) => {
          errorSub.next(new Error('查询是否有相同订阅源失败'));
          resolve(true);
        },
      });
    });
  }

  private checkValidForm(form: FormGroup): { code: number; message?: string } {
    switch (form.value.type) {
      case NotifyObserverTypes.MEDIUM:
        return form.value.mediumHomeLink ? { code: 0 } : { code: -1, message: `没有填写medium主页链接` }
      case NotifyObserverTypes.MIRROR:
        return form.value.mirrorHomeLink ? { code: 0 } : { code: -1, message: `没有填写mirror主页链接` }
      case NotifyObserverTypes.TWITTER:
        return form.value.twitterHomeLink ? { code: 0 } : { code: -1, message: `没有填写twitter主页链接` }
      case NotifyObserverTypes.TWITTER_SPACE:
        return form.value.twitterSpaceHomeLink ? { code: 0 } : { code: -1, message: `没有填写twitter主页链接` }
      case NotifyObserverTypes.QUEST3:
        return form.value.quest3HomeLink ? { code: 0 } : { code: -1, message: `没有填写quest3主页链接` }
      case NotifyObserverTypes.GALXE:
        return form.value.galxeHomeLink ? { code: 0 } : { code: -1, message: `没有填写galxe主页链接` }
      case NotifyObserverTypes.TIMER:
        return (form.value.notifyShowTitle && (Array.isArray(form.value.timerHour)) && form.value.timerHour.length > 0 && (Array.isArray(form.value.timerMinute)) && form.value.timerMinute.length > 0)
          ? { code: 0 } : { code: -1, message: `通知标题必填，hour minute必填` }
      case NotifyObserverTypes.SNAPSHOT:
        return form.value.snapshotHomeLink ? { code: 0 } : { code: -1, message: `没有填写snapshot主页链接` }
      case NotifyObserverTypes.GUILD:
        return form.value.guildHomeLink ? { code: 0 } : { code: -1, message: `没有填写guild主页链接` }

      case NotifyObserverTypes.XIAOYUZHOU:
        return form.value.xiaoyuzhouHomeLink ? { code: 0 } : { code: -1, message: `没有填写xiaoyuzhou主页链接` }
      default:
        return { code: 0 }
    }
  }

  private resolveExistedCondition(form: FormGroup): Partial<NotifyObserver> | null {
    switch (form.value.type) {
      case NotifyObserverTypes.MEDIUM:
        return form.value.mediumHomeLink ? { type: NotifyObserverTypes.MEDIUM, mediumHomeLink: form.value.mediumHomeLink } : null
      case NotifyObserverTypes.MIRROR:
        return form.value.mirrorHomeLink ? { type: NotifyObserverTypes.MIRROR, mirrorHomeLink: form.value.mirrorHomeLink } : null
      case NotifyObserverTypes.TWITTER:
        return form.value.twitterHomeLink ? { type: NotifyObserverTypes.TWITTER, twitterHomeLink: form.value.twitterHomeLink } : null
      case NotifyObserverTypes.TWITTER_SPACE:
        return form.value.twitterSpaceHomeLink ? { type: NotifyObserverTypes.TWITTER_SPACE, twitterSpaceHomeLink: form.value.twitterSpaceHomeLink } : null
      case NotifyObserverTypes.QUEST3:
        return form.value.quest3HomeLink ? { type: NotifyObserverTypes.QUEST3, quest3HomeLink: form.value.quest3HomeLink } : null
      case NotifyObserverTypes.GALXE:
        return form.value.galxeHomeLink ? { type: NotifyObserverTypes.GALXE, galxeHomeLink: form.value.galxeHomeLink } : null
      case NotifyObserverTypes.TIMER:
        return form.value.timerNotifyShowUrl ? { type: NotifyObserverTypes.TIMER, timerNotifyShowUrl: form.value.timerNotifyShowUrl } : null
      case NotifyObserverTypes.SNAPSHOT:
        return form.value.snapshotHomeLink ? { type: NotifyObserverTypes.SNAPSHOT, snapshotHomeLink: form.value.snapshotHomeLink } : null
      case NotifyObserverTypes.GUILD:
        return form.value.guildHomeLink ? { type: NotifyObserverTypes.GUILD, guildHomeLink: form.value.guildHomeLink } : null

      case NotifyObserverTypes.XIAOYUZHOU:
        return form.value.xiaoyuzhouHomeLink ? { type: NotifyObserverTypes.XIAOYUZHOU, xiaoyuzhouHomeLink: form.value.xiaoyuzhouHomeLink } : null
      default:
        return null
    }
  }

  private resolveDefaultType(): NotifyObserverTypes {
    const lastType = localStorage.getItem('CREATE_NOTIFY_OBSERVER_DEFAULT_TYPE') as NotifyObserverTypes
    return lastType || NotifyObserverTypes.MEDIUM
  }

  private updateDefaultType(type: NotifyObserverTypes) {
    localStorage.setItem('CREATE_NOTIFY_OBSERVER_DEFAULT_TYPE', type)
  }
}
