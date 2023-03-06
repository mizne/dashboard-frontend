import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateSnapshotComponent } from './snapshot.component';

@Injectable()
export class SnapshotService implements NotifyObserverTypeServiceInterface {
  constructor() {
  }
  type: NotifyObserverTypes = NotifyObserverTypes.SNAPSHOT;

  resolveComponent(): Type<FormItemInterface> {
    return CreateSnapshotComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.snapshotHomeLink ? { code: 0 } : { code: -1, message: `没有填写snapshot主页链接` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.snapshotHomeLink ? { type: NotifyObserverTypes.SNAPSHOT, snapshotHomeLink: obj.snapshotHomeLink } : null
  }

  resolveHref(item: NotifyObserver): string | undefined {
    return item.snapshotHomeLink
  }

  resolveDesc(item: NotifyObserver): string | undefined {
    return item.snapshotTitleKey
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      snapshotHomeLink: [obj.snapshotHomeLink],
      snapshotTitleKey: [obj.snapshotTitleKey],
    }
  }
}