import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateHookComponent } from './hook.component';

@Injectable()
export class HookService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.HOOK;

  resolveComponent(): Type<FormItemInterface> {
    return CreateHookComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    if (obj.notifyShowTitle && obj.hookType) {
      return { code: 0 }
    }
    return { code: -1, message: `通知标题必填, 钩子类型必填` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return !obj.hookEnableScript ? { type: NotifyObserverTypes.HOOK, notifyShowTitle: obj.notifyShowTitle, hookNotifyShowUrl: obj.hookNotifyShowUrl } : null
  }

  resolveHref(item: NotifyObserver): string {
    return item.hookNotifyShowUrl || ''
  }

  resolveDesc(item: NotifyObserver): string {
    const infos = [
      item.hookNotifyShowDesc || '',
    ]
    return infos.filter(e => !!e).join(' ')
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      hookType: [obj.hookType],
      hookEnableScript: [!!obj.hookEnableScript],
      hookScript: [obj.hookScript],
      hookEnableStatistics: [!!obj.hookEnableStatistics],
      hookStatisticsDefinitions: [obj.hookStatisticsDefinitions],
      hookNotifyShowDesc: [obj.hookNotifyShowDesc],
      hookNotifyShowUrl: [obj.hookNotifyShowUrl],
      hookOnce: [!!obj.hookOnce],
      hookLogo: [obj.hookLogo]
    }
  }


}