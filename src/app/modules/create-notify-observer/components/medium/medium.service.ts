import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateMediumComponent } from './medium.component';

@Injectable()
export class MediumService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.MEDIUM;

  resolveComponent(): Type<FormItemInterface> {
    return CreateMediumComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.mediumHomeLink ? { code: 0 } : { code: -1, message: `没有填写medium主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.mediumHomeLink ? { type: NotifyObserverTypes.MEDIUM, mediumHomeLink: obj.mediumHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string | undefined {
    return item.mediumHomeLink
  }

  resolveDesc(item: NotifyObserver): string | undefined {
    return item.mediumTitleKey
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      mediumHomeLink: [obj.mediumHomeLink],
      mediumTitleKey: [obj.mediumTitleKey],
    }
  }
}