import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subscription } from 'rxjs';
import { isEmpty } from 'src/app/utils';


export const OBJECT_INPUT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ObjectInputComponent),
  multi: true
};

@Component({
  selector: 'app-object-input',
  templateUrl: './object-input.component.html',
  providers: [OBJECT_INPUT_VALUE_ACCESSOR]
})
export class ObjectInputComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;

  fields: Array<{ keyCtrl: FormControl; valueCtrl: FormControl }> = [];

  subscriptions: Subscription[] = [];

  constructor() { }

  ngOnInit(): void {

  }

  addField() {
    this.fields.push({
      keyCtrl: new FormControl(null),
      valueCtrl: new FormControl(null)
    })

    this.subscribeFieldChange();
  }

  removeField(field: { keyCtrl: FormControl; valueCtrl: FormControl }) {
    const index = this.fields.indexOf(field);
    if (index >= 0) {
      this.fields.splice(index, 1);

      this.emitValue();
      this.subscribeFieldChange();
    }
  }

  subscribeFieldChange() {
    for (const e of this.subscriptions) {
      e.unsubscribe();
    }
    this.subscriptions = [];

    for (const field of this.fields) {
      const subKey = field.keyCtrl.valueChanges.subscribe(() => {
        this.emitValue()
      })
      const subValue = field.valueCtrl.valueChanges.subscribe(() => {
        this.emitValue()
      })

      this.subscriptions.push(subKey, subValue);
    }
  }

  emitValue() {
    if (this.onChange) {
      const o: { [key: string]: any } = {};
      for (const item of this.fields) {
        if (!isEmpty(item.keyCtrl.value) && !isEmpty(item.valueCtrl.value)) {
          Object.assign(o, {
            [item.keyCtrl.value]: this.adjustValue(item.valueCtrl.value)
          })
        }
      }

      this.onChange(o);
      // console.log(`emitValue() `, o)
    }
  }

  ngOnDestroy(): void { }

  writeValue(obj: any): void {
    if (obj && typeof obj === 'object' && Object.keys(obj).length > 0) {
      for (const key of Object.keys(obj)) {
        this.fields.push({
          keyCtrl: new FormControl(key),
          valueCtrl: new FormControl(obj[key])
        })
      }

      this.subscribeFieldChange();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    // noop
  }
  setDisabledState?(isDisabled: boolean): void {
    // noop
  }

  private adjustValue(v: string): number | string {
    if (/^[\d]{1,}$/.test(v)) {
      return Number(v)
    }
    return v
  }
}