import { FormGroup } from "@angular/forms";
import { NotifyObserverModalActions } from "../create-notify-observer-modal-actions";

export interface FormItemInterface {
  data: FormGroup;
  action: NotifyObserverModalActions
}
