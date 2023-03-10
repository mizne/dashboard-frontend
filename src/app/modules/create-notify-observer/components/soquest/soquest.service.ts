import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateSoQuestComponent } from './soquest.component';

@Injectable()
export class SoQuestService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.SOQUEST;

  resolveComponent(): Type<FormItemInterface> {
    return CreateSoQuestComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.soQuestHomeLink ? { code: 0 } : { code: -1, message: `没有填写soquest主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.soQuestHomeLink ? { type: NotifyObserverTypes.SOQUEST, soQuestHomeLink: obj.soQuestHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string {
    return item.soQuestHomeLink || ''
  }

  resolveDesc(item: NotifyObserver): string {
    return item.soQuestTitleKey || ''
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      soQuestHomeLink: [obj.soQuestHomeLink],
      soQuestTitleKey: [obj.soQuestTitleKey],
    }
  }
}