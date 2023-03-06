import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateMirrorComponent } from './mirror.component';

@Injectable()
export class MirrorService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.MIRROR;

  resolveComponent(): Type<FormItemInterface> {
    return CreateMirrorComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.mirrorHomeLink ? { code: 0 } : { code: -1, message: `没有填写mirror主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.mirrorHomeLink ? { type: NotifyObserverTypes.MIRROR, mirrorHomeLink: obj.mirrorHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string | undefined {
    return item.mirrorHomeLink
  }

  resolveDesc(item: NotifyObserver): string | undefined {
    return item.mirrorTitleKey
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      mirrorHomeLink: [obj.mirrorHomeLink],
      mirrorTitleKey: [obj.mirrorTitleKey],
    }
  }
}