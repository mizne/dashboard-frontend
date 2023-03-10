import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateGhostComponent } from './ghost.component';

@Injectable()
export class GhostService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.GHOST;

  resolveComponent(): Type<FormItemInterface> {
    return CreateGhostComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.ghostHomeLink ? { code: 0 } : { code: -1, message: `没有填写ghost主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.ghostHomeLink ? { type: NotifyObserverTypes.GHOST, ghostHomeLink: obj.ghostHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string {
    return item.ghostHomeLink || ''
  }

  resolveDesc(item: NotifyObserver): string {
    return item.ghostTitleKey || ''
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      ghostHomeLink: [obj.ghostHomeLink],
      ghostTitleKey: [obj.ghostTitleKey],
    }
  }
}