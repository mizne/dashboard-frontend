import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateGuildComponent } from './guild.component';

@Injectable()
export class GuildService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.GUILD;

  resolveComponent(): Type<FormItemInterface> {
    return CreateGuildComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.guildHomeLink ? { code: 0 } : { code: -1, message: `没有填写guild主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.guildHomeLink ? { type: NotifyObserverTypes.GUILD, guildHomeLink: obj.guildHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string {
    return item.guildHomeLink || ''
  }

  resolveDesc(item: NotifyObserver): string {
    return item.guildTitleKey || ''
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      guildHomeLink: [obj.guildHomeLink],
      guildTitleKey: [obj.guildTitleKey],
    }
  }
}