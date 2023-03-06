import { Injectable, Type } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { NotifyObserver, NotifyObserverTypes } from "src/app/shared";
import { FormItemInterface } from "./components/form-item.interface";
import { NotifyObserverModalActions } from "./create-notify-observer-modal-actions";
import { NotifyObserverTypeServiceInterface } from "./notify-observer-type-service.interface";

@Injectable()
export class NotifyObserverTypeManagerService {

  private readonly typeServices: Array<NotifyObserverTypeServiceInterface> = []

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
  ) { }

  registerTypeService(item: NotifyObserverTypeServiceInterface) {
    const index = this.typeServices.findIndex(e => e.type === item.type);
    if (index >= 0) {
      this.notification.warning(`NotifyObserverTypeManagerService`, `Duplicate RegisterTypeService`)
    } else {
      this.typeServices.push(item);
    }
  }

  createBaseForm(obj: Partial<NotifyObserver>): FormGroup<any> {
    const type = obj.type || this.resolveDefaultType()
    const form = this.fb.group({
      type: [type, [Validators.required]],
      enableTracking: [
        obj.enableTracking === false ? false : true,
        [Validators.required],
      ],
      followedProjectID: [obj.followedProjectID],
      notifyShowTitle: [obj.notifyShowTitle],
    });

    return form;
  }

  createSecondForm(type: NotifyObserverTypes, obj: Partial<NotifyObserver>, action: NotifyObserverModalActions): FormGroup<any> {
    const o = this.resolvePartialFormGroup(type, obj, action);
    return this.fb.group(o)
  }

  resolveComponent(type: NotifyObserverTypes): Type<FormItemInterface> | null {
    const typeService = this.typeServices.find(e => e.type === type);
    if (typeService) {
      return typeService.resolveComponent();
    } else {
      this.notification.warning(`NotifyObserverTypeManagerService`, `Not Found resolveComponent() ${type}`);
      return null
    }
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string } {
    const typeService = this.typeServices.find(e => e.type === obj.type);
    if (typeService) {
      return typeService.checkValidForm(obj);
    } else {
      this.notification.warning(`NotifyObserverTypeManagerService`, `Not Found checkValidForm() ${obj.type}`);
      return { code: 0 }
    }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    const typeService = this.typeServices.find(e => e.type === obj.type);
    if (typeService) {
      return typeService.resolveExistedCondition(obj);
    } else {
      this.notification.warning(`NotifyObserverTypeManagerService`, `Not Found resolveExistedCondition() ${obj.type}`);
      return null
    }
  }

  resolveHref(item: NotifyObserver) {
    const typeService = this.typeServices.find(e => e.type === item.type);
    if (typeService) {
      return typeService.resolveHref(item);
    } else {
      // this.notification.warning(`NotifyObserverTypeManagerService`, `Not Found resolveHref() ${item.type}`);
      return ''
    }
  }

  resolveDesc(item: NotifyObserver) {
    const typeService = this.typeServices.find(e => e.type === item.type);
    if (typeService) {
      return typeService.resolveDesc(item);
    } else {
      // this.notification.warning(`NotifyObserverTypeManagerService`, `Not Found resolveDesc() ${item.type}`);
      return ''
    }
  }

  updateDefaultType(type: NotifyObserverTypes) {
    localStorage.setItem('CREATE_NOTIFY_OBSERVER_DEFAULT_TYPE', type)
  }

  private resolveDefaultType(): NotifyObserverTypes {
    const lastType = localStorage.getItem('CREATE_NOTIFY_OBSERVER_DEFAULT_TYPE') as NotifyObserverTypes
    return lastType || NotifyObserverTypes.MEDIUM
  }

  private resolvePartialFormGroup(type: NotifyObserverTypes, obj: Partial<NotifyObserver>, action: NotifyObserverModalActions): any {
    const typeService = this.typeServices.find(e => e.type === type);
    if (typeService) {
      return typeService.resolvePartialFormGroup(obj, action);
    } else {
      this.notification.warning(`NotifyObserverTypeManagerService`, `Not Found resolvePartialFormGroup() ${type}`);
      return {}
    }
  }
}