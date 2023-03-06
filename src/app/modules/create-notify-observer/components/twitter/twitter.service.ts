import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateTwitterComponent } from './twitter.component';

@Injectable()
export class TwitterService implements NotifyObserverTypeServiceInterface {
  constructor() {
  }
  type: NotifyObserverTypes = NotifyObserverTypes.TWITTER;

  resolveComponent(): Type<FormItemInterface> {
    return CreateTwitterComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.twitterHomeLink ? { code: 0 } : { code: -1, message: `没有填写twitter主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.twitterHomeLink ? { type: NotifyObserverTypes.TWITTER, twitterHomeLink: obj.twitterHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string | undefined {
    return item.twitterHomeLink
  }

  resolveDesc(item: NotifyObserver): string | undefined {
    return item.twitterTitleKey
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      twitterHomeLink: [obj.twitterHomeLink],
      twitterTitleKey: [obj.twitterTitleKey],
      twitterTitleKeyWithDefault: [action === NotifyObserverModalActions.CREATE ? true : !!obj.twitterTitleKeyWithDefault],
      twitterWithReply: [action === NotifyObserverModalActions.CREATE ? true : !!obj.twitterWithReply],
      twitterWithLike: [!!obj.twitterWithLike],
      twitterWithFollowingsChange: [!!obj.twitterWithFollowingsChange],
    }
  }
}