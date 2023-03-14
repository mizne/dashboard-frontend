import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateTimerComponent } from './timer.component';

@Injectable()
export class TimerService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.TIMER;

  resolveComponent(): Type<FormItemInterface> {
    return CreateTimerComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return (obj.notifyShowTitle && (Array.isArray(obj.timerHour)) && (obj.timerHour as Array<number>).length > 0 && (Array.isArray(obj.timerMinute)) && (obj.timerMinute as Array<number>).length > 0)
      ? { code: 0 } : { code: -1, message: `通知标题必填，hour minute必填` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return !obj.timerEnableScript ? { type: NotifyObserverTypes.TIMER, notifyShowTitle: obj.notifyShowTitle, timerNotifyShowUrl: obj.timerNotifyShowUrl } : null
  }

  resolveHref(item: NotifyObserver): string {
    return item.timerNotifyShowUrl || ''
  }

  resolveDesc(item: NotifyObserver): string {
    const infos = [
      item.timerNotifyShowDesc || '',
      this.isNumberArray(item.timerMonth) ? `${item.timerMonth?.join(',')}月` : '',
      this.isNumberArray(item.timerDate) ? ` ${item.timerDate?.join(',')}日` : '',
      this.isNumberArray(item.timerHour) ? `${item.timerHour?.join(',')}时` : '',
      this.isNumberArray(item.timerMinute) ? `${item.timerMinute?.join(',')}分` : '',
    ]
    return infos.filter(e => !!e).join(' ')
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      timerHour: [obj.timerHour],
      timerMinute: [obj.timerMinute],
      timerDate: [obj.timerDate],
      timerMonth: [obj.timerMonth],
      timerEnableScript: [!!obj.timerEnableScript],
      timerScript: [obj.timerScript],
      timerEnableStatistics: [!!obj.timerEnableStatistics],
      timerStatisticsDefinitions: [obj.timerStatisticsDefinitions],
      timerNotifyShowDesc: [obj.timerNotifyShowDesc],
      timerNotifyShowUrl: [obj.timerNotifyShowUrl],
      timerOnce: [!!obj.timerOnce],
    }
  }

  private isNumberArray(v?: number[]): boolean {
    return Array.isArray(v) && v.length > 0 && v.every(f => typeof f === 'number')
  }
}