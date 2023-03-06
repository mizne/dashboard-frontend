import { Type } from "@angular/core";
import { NotifyObserver, NotifyObserverTypes } from "src/app/shared";
import { FormItemInterface } from "./components/form-item.interface";
import { NotifyObserverModalActions } from "./create-notify-observer-modal-actions";

export interface NotifyObserverTypeServiceInterface {
  type: NotifyObserverTypes
  resolveComponent(): Type<FormItemInterface>

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null

  resolveHref(item: NotifyObserver): string | undefined;

  resolveDesc(item: NotifyObserver): string | undefined;

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions): any
}