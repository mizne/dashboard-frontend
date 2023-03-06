import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateSubstackComponent } from './substack.component';

@Injectable()
export class SubstackService implements NotifyObserverTypeServiceInterface {
  constructor() {
  }
  type: NotifyObserverTypes = NotifyObserverTypes.SUBSTACK;

  resolveComponent(): Type<FormItemInterface> {
    return CreateSubstackComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.substackHomeLink ? { code: 0 } : { code: -1, message: `没有填写substack主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.substackHomeLink ? { type: NotifyObserverTypes.SUBSTACK, substackHomeLink: obj.substackHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string | undefined {
    return item.substackHomeLink
  }

  resolveDesc(item: NotifyObserver): string | undefined {
    return item.substackTitleKey
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      substackHomeLink: [obj.substackHomeLink],
      substackTitleKey: [obj.substackTitleKey],
    }
  }
}