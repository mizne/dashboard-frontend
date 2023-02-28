import { Injectable, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Subject } from 'rxjs';
import {
  Investor,
  InvestorService,
  SharedService,
} from 'src/app/shared';
import { isNil } from 'src/app/utils';
import { CreateInvestorComponent } from './components/create-investor/create-investor.component';

export enum InvestorModalActions {
  CREATE = 'create',
  UPDATE = 'update',
}

@Injectable()
export class CreateInvestorService {
  constructor(
    private modal: NzModalService,
    private investorService: InvestorService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private sharedService: SharedService,
  ) { }

  // 1. 成功 -> 结束
  // 2. 失败 -> 失败 -> 结束
  // 3. 失败 -> 失败 -> 成功 -> 结束
  createModal(
    title: string,
    obj: Partial<Investor>,
    action: InvestorModalActions = InvestorModalActions.CREATE
  ): {
    modal: NzModalRef<any>;
    success: Observable<any>;
    error: Observable<Error>;
  } {
    const form = this.fb.group({
      name: [obj.name],
      cryptoFundraisingURL: [obj.cryptoFundraisingURL],
      rootDataPayload: [obj.rootDataPayload],
    });
    // 创建成功时 会next值 弹框会关闭 且会结束
    const successSubject = new Subject<any>();

    // 创建失败时 会next Error 弹框不会关闭且不会结束 只有弹框被取消时才会结束
    const errorSubject = new Subject<Error>();
    const modal = this.modal.create({
      nzTitle: title,
      nzWidth: 800,
      nzContent: CreateInvestorComponent,
      nzViewContainerRef: this.sharedService.getAppViewContainerRef(),
      nzComponentParams: {
        form: form,
      },
      nzOnOk: () => {
        return action === InvestorModalActions.CREATE
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
      this.investorService.create(form.value).subscribe({
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
      this.investorService.update(id, form.value).subscribe({
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

  private checkExisted(form: FormGroup, errorSub: Subject<Error>, id?: string): Promise<boolean> {
    const condition = this.resolveExistedCondition(form);
    if (!condition) {
      return Promise.resolve(false)
    }

    return new Promise((resolve, reject) => {
      this.investorService.queryList(condition).subscribe({
        next: (results) => {
          if (id) {
            const theOther = results.find(e => e._id !== id);
            if (theOther) {
              errorSub.next(new Error('相同数据已存在'));
              resolve(true)
            } else {
              resolve(false)
            }
          } else {
            if (results.length > 0) {
              errorSub.next(new Error('相同数据已存在'));
              resolve(true)
            } else {
              resolve(false)
            }
          }
        },
        error: (e) => {
          errorSub.next(new Error('查询是否有相同数据失败'));
          resolve(true);
        },
      });
    });
  }

  private checkValidForm(form: FormGroup): { code: number; message?: string } {
    return form.value.name ? { code: 0 } : { code: -1, message: `没有填写name` }
  }

  private resolveExistedCondition(form: FormGroup): Partial<Investor> | null {
    return form.value.name ? { name: form.value.name } : null
  }
}
