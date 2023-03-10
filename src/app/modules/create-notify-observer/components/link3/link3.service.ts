import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateLink3Component } from './link3.component';

@Injectable()
export class Link3Service implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }

  type: NotifyObserverTypes = NotifyObserverTypes.LINK3;

  resolveComponent(): Type<FormItemInterface> {
    return CreateLink3Component
  }
  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.link3HomeLink ? { code: 0 } : { code: -1, message: `没有填写link3主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.link3HomeLink ? { type: NotifyObserverTypes.LINK3, link3HomeLink: obj.link3HomeLink } : null
  }
  resolveHref(item: NotifyObserver): string {
    return item.link3HomeLink || ''
  }
  resolveDesc(item: NotifyObserver): string {
    return item.link3TitleKey || ''
  }
  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      link3HomeLink: [obj.link3HomeLink],
      link3TitleKey: [obj.link3TitleKey],
    }
  }
}