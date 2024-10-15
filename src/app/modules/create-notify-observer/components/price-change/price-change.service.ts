import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreatePriceChangeComponent } from './price-change.component';

@Injectable()
export class PriceChangeService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.PRICE_CHANGE;

  resolveComponent(): Type<FormItemInterface> {
    return CreatePriceChangeComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    if (
      obj.notifyShowTitle && obj.priceChangeType && obj.priceChangeCexTokenSymbol && ((Array.isArray(obj.priceChangeToValue) && obj.priceChangeToValue.length > 0) || (Array.isArray(obj.priceChangeInDays) && obj.priceChangeInDays.length > 0))) {
      return { code: 0 }
    }
    return { code: -1, message: `通知标题, 价格类型, 标的symbol必填, 价格数值/周期天数/涨跌幅数值及周期天数相对应价格类型有一个必填` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return {
      type: NotifyObserverTypes.PRICE_CHANGE,
      priceChangeType: obj.priceChangeType,
      priceChangeCexTokenSymbol: obj.priceChangeCexTokenSymbol,
      priceChangeToValue: obj.priceChangeToValue,
      priceChangeInDays: obj.priceChangeInDays,
      priceChangePercentInDays: obj.priceChangePercentInDays,
      priceChangePercentValue: obj.priceChangePercentValue,
    }
  }

  resolveHref(item: NotifyObserver): string {
    return ``
  }

  resolveDesc(item: NotifyObserver): string {
    if (typeof item.priceChangeToValue === 'number') {
      return `${item.priceChangeCexTokenSymbol} ${item.priceChangeType} ${item.priceChangeToValue}`
    }
    if (typeof item.priceChangeInDays === 'number') {
      return `${item.priceChangeCexTokenSymbol} ${item.priceChangeType} ${item.priceChangeInDays}`
    }

    if ((Array.isArray(item.priceChangeToValue) && item.priceChangeToValue.length > 0)) {
      return `${item.priceChangeCexTokenSymbol} ${item.priceChangeType} ${item.priceChangeToValue.join(', ')}`
    }
    if (Array.isArray(item.priceChangeInDays) && item.priceChangeInDays.length > 0) {
      return `${item.priceChangeCexTokenSymbol} ${item.priceChangeType} ${item.priceChangeInDays.join(', ')}`
    }

    if (Array.isArray(item.priceChangePercentValue) && item.priceChangePercentValue.length > 0 &&
      Array.isArray(item.priceChangePercentInDays) && item.priceChangePercentInDays.length > 0) {
      return `${item.priceChangeCexTokenSymbol} ${item.priceChangePercentInDays.join(', ')}天内 ${item.priceChangeType} ${item.priceChangePercentValue.join(', ')}`
    }

    return `${item.priceChangeCexTokenSymbol} ${item.priceChangeType}`
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      priceChangeType: [obj.priceChangeType],
      priceChangeCexTokenSymbol: [obj.priceChangeCexTokenSymbol],
      priceChangeToValue: [obj.priceChangeToValue],
      priceChangeInDays: [obj.priceChangeInDays],
      priceChangePercentValue: [obj.priceChangePercentValue],
      priceChangePercentInDays: [obj.priceChangePercentInDays],
    }
  }
}