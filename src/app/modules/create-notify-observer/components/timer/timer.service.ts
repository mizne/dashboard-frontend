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
    if ((obj.notifyShowTitle && (Array.isArray(obj.timerHour)) && (obj.timerHour as Array<number>).length > 0 && (Array.isArray(obj.timerMinute)) && (obj.timerMinute as Array<number>).length > 0)) {
      // const inServiceMaintain = this.hasInServiceMaintainTime(obj.timerHour, obj.timerMinute)

      // return inServiceMaintain ? { code: -1, message: `03:02 和 15:02 为服务重启时间，不建议在临近时间设置定时任务` } : { code: 0 }
      return { code: 0 }
    }
    return { code: -1, message: `通知标题必填，hour minute必填` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return !obj.timerEnableScript ? { type: NotifyObserverTypes.TIMER, notifyShowTitle: obj.notifyShowTitle, timerNotifyShowUrl: obj.timerNotifyShowUrl } : null
  }

  resolveHref(item: NotifyObserver): string {
    return item.timerNotifyShowUrl || ''
  }

  resolveDesc(item: NotifyObserver): string {
    const infos = [
      this.isNumberArray(item.timerDayOfWeek) ? `${this.normalizeDayOfWeekArray(item.timerDayOfWeek as number[])}` : '',
      this.isNumberArray(item.timerMonth) ? `${this.normalizeNumberArray(item.timerMonth as number[])}月` : '',
      this.isNumberArray(item.timerDate) ? ` ${this.normalizeNumberArray(item.timerDate as number[])}日` : '',
      this.isNumberArray(item.timerHour) ? `${this.normalizeNumberArray(item.timerHour as number[])}时` : '',
      this.isNumberArray(item.timerMinute) ? `${this.normalizeNumberArray(item.timerMinute as number[])}分` : '',
      item.timerNotifyShowDesc || '',
    ]
    return infos.filter(e => !!e).join(' ')
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      timerHour: [obj.timerHour],
      timerMinute: [obj.timerMinute],
      timerDate: [obj.timerDate],
      timerMonth: [obj.timerMonth],
      timerDayOfWeek: [obj.timerDayOfWeek],
      timerEnableScript: [!!obj.timerEnableScript],
      timerScript: [obj.timerScript],
      timerEnableStatistics: [!!obj.timerEnableStatistics],
      timerStatisticsDefinitions: [obj.timerStatisticsDefinitions],
      timerNotifyShowDesc: [obj.timerNotifyShowDesc],
      timerNotifyShowUrl: [obj.timerNotifyShowUrl],
      timerOnce: [!!obj.timerOnce],
      timerLogo: [obj.timerLogo]
    }
  }

  private isNumberArray(v?: number[]): boolean {
    return Array.isArray(v) && v.length > 0 && v.every(f => typeof f === 'number')
  }

  private normalizeNumberArray(nums: number[]): string {
    const groupNums = [];
    const sortedNums = Array.from(new Set(nums.sort((a, b) => a - b)))

    for (const e of sortedNums) {
      if (groupNums.length === 0) {
        groupNums.push([e])
      } else {
        const lastGroup = groupNums[groupNums.length - 1];
        const lastNum = lastGroup[lastGroup.length - 1];
        if (lastNum === e - 1) {
          lastGroup.push(e)
        } else {
          groupNums.push([e])
        }
      }
    }
    return groupNums.map(e => e.length > 1 ? `${e[0]}-${e[e.length - 1]}` : `${e[0]}`).join(',')
  }

  private normalizeDayOfWeekArray(nums: number[]): string {
    const strs = [
      '周日', '周一', '周二', '周三', '周四', '周五', '周六'
    ]
    return nums.map(e => strs[e] || '未知').join(',')
  }

  private hasInServiceMaintainTime(timerHour: number[], timerMinute: number[]): boolean {
    const inHour = !![3, 15].find(e => timerHour.indexOf(e) >= 0)
    const inMinute = !![2, 3, 4, 5, 6, 7, 8].find(e => timerMinute.indexOf(e) >= 0)
    return inHour && inMinute
  }
}