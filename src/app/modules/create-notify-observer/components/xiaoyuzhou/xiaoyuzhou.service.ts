import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateXiaoYuZhouComponent } from './xiaoyuzhou.component';

@Injectable()
export class XiaoYuZhouService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.XIAOYUZHOU;

  resolveComponent(): Type<FormItemInterface> {
    return CreateXiaoYuZhouComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.xiaoyuzhouHomeLink ? { code: 0 } : { code: -1, message: `没有填写xiaoyuzhou主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.xiaoyuzhouHomeLink ? { type: NotifyObserverTypes.XIAOYUZHOU, xiaoyuzhouHomeLink: obj.xiaoyuzhouHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string | undefined {
    return item.xiaoyuzhouHomeLink
  }

  resolveDesc(item: NotifyObserver): string | undefined {
    return item.xiaoyuzhouTitleKey
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      xiaoyuzhouHomeLink: [obj.xiaoyuzhouHomeLink],
      xiaoyuzhouTitleKey: [obj.xiaoyuzhouTitleKey],
    }
  }
}