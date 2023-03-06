import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateQuest3Component } from './quest3.component';

@Injectable()
export class Quest3Service implements NotifyObserverTypeServiceInterface {
  constructor() {
  }
  type: NotifyObserverTypes = NotifyObserverTypes.QUEST3;

  resolveComponent(): Type<FormItemInterface> {
    return CreateQuest3Component
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.quest3HomeLink ? { code: 0 } : { code: -1, message: `没有填写quest3主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.quest3HomeLink ? { type: NotifyObserverTypes.QUEST3, quest3HomeLink: obj.quest3HomeLink } : null
  }

  resolveHref(item: NotifyObserver): string | undefined {
    return item.quest3HomeLink
  }

  resolveDesc(item: NotifyObserver): string | undefined {
    return item.quest3TitleKey
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      quest3HomeLink: [obj.quest3HomeLink],
      quest3TitleKey: [obj.quest3TitleKey],
    }
  }
}