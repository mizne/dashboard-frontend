import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateTwitterSpaceComponent } from './twitter-space.component';

@Injectable()
export class TwitterSpaceService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.TWITTER_SPACE;

  resolveComponent(): Type<FormItemInterface> {
    return CreateTwitterSpaceComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.twitterSpaceHomeLink ? { code: 0 } : { code: -1, message: `没有填写twitter主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.twitterSpaceHomeLink ? { type: NotifyObserverTypes.TWITTER_SPACE, twitterSpaceHomeLink: obj.twitterSpaceHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string | undefined {
    return item.twitterSpaceHomeLink
  }

  resolveDesc(item: NotifyObserver): string | undefined {
    return item.twitterSpaceTitleKey
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      twitterSpaceHomeLink: [obj.twitterSpaceHomeLink],
      twitterSpaceTitleKey: [obj.twitterSpaceTitleKey],
    }
  }
}