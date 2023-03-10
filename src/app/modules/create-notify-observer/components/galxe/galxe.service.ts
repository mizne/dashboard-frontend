import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateGalxeComponent } from './galxe.component';

@Injectable()
export class GalxeService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.GALXE;

  resolveComponent(): Type<FormItemInterface> {
    return CreateGalxeComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.galxeHomeLink ? { code: 0 } : { code: -1, message: `没有填写galxe主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.galxeHomeLink ? { type: NotifyObserverTypes.GALXE, galxeHomeLink: obj.galxeHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string {
    return item.galxeHomeLink || ''
  }

  resolveDesc(item: NotifyObserver): string {
    return item.galxeTitleKey || ''
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      galxeHomeLink: [obj.galxeHomeLink],
      galxeTitleKey: [obj.galxeTitleKey],
    }
  }
}