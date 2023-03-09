import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateBlogComponent } from './blog.component';

@Injectable()
export class BlogService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.BLOG;

  resolveComponent(): Type<FormItemInterface> {
    return CreateBlogComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    return obj.blogRequestURL ? { code: 0 } : { code: -1, message: `没有填写blogRequestURL` }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.blogRequestURL ? { type: NotifyObserverTypes.BLOG, blogRequestURL: obj.blogRequestURL } : null
  }

  resolveHref(item: NotifyObserver): string | undefined {
    return item.blogRequestURL
  }

  resolveDesc(item: NotifyObserver): string | undefined {
    return item.blogRequestURL
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    return {
      blogRequestURL: [obj.blogRequestURL],
      blogRequestMethod: [obj.blogRequestMethod || 'get'],
      blogRequestHeaders: [obj.blogRequestHeaders],
      blogScript: [obj.blogScript],
    }
  }
}