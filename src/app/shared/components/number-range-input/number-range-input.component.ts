import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge } from 'rxjs';

export const NUMBER_RANGE_INPUT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NumberRangeInputComponent),
  multi: true
};

@Component({
  selector: 'app-number-range-input',
  templateUrl: './number-range-input.component.html',
  providers: [NUMBER_RANGE_INPUT_VALUE_ACCESSOR]
})
export class NumberRangeInputComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;

  leftSelectOptions = [
    {
      label: '>',
      value: '$gt'
    },
    {
      label: '>=',
      value: '$gte'
    },
  ]
  leftSelectCtrl = new FormControl()
  leftNumberCtrl = new FormControl(0)

  rightSelectOptions = [
    {
      label: '<',
      value: '$lt'
    },
    {
      label: '<=',
      value: '$lte'
    },
  ]
  rightSelectCtrl = new FormControl()
  rightNumberCtrl = new FormControl(1)


  constructor(
  ) { }

  ngOnInit(): void {
    merge(
      this.leftSelectCtrl.valueChanges,
      this.leftNumberCtrl.valueChanges,
      this.rightSelectCtrl.valueChanges,
      this.rightNumberCtrl.valueChanges
    ).subscribe(() => {
      this.emitValue()
    })
  }

  emitValue() {
    if (this.onChange) {
      this.onChange(this.resolveValue())
    }
  }

  private resolveValue() {
    const obj = {};

    if (this.leftSelectCtrl.value && typeof this.leftNumberCtrl.value === 'number') {
      Object.assign(obj, {
        [this.leftSelectCtrl.value]: this.leftNumberCtrl.value
      })
    }

    if (this.rightSelectCtrl.value && typeof this.rightNumberCtrl.value === 'number') {
      Object.assign(obj, {
        [this.rightSelectCtrl.value]: this.rightNumberCtrl.value
      })
    }

    if (Object.keys(obj).length > 0) {
      return obj
    } else {
      return null
    }
  }

  ngOnDestroy(): void { }

  writeValue(obj: any): void {
    if (!obj) {
      this.leftSelectCtrl.patchValue(null, { emitEvent: false })
      this.leftNumberCtrl.patchValue(0, { emitEvent: false })
      this.rightSelectCtrl.patchValue(null, { emitEvent: false })
      this.rightNumberCtrl.patchValue(0, { emitEvent: false })
      return
    }

    const keys = Object.keys(obj);
    keys.forEach(key => {
      const indexOfLeft = this.leftSelectOptions.findIndex(e => e.value === key);
      if (indexOfLeft >= 0 && typeof obj[key] === 'number') {
        this.leftSelectCtrl.patchValue(key, { emitEvent: false })
        this.leftNumberCtrl.patchValue(obj[key], { emitEvent: false })
      }

      const indexOfRight = this.rightSelectOptions.findIndex(e => e.value === key);
      if (indexOfRight >= 0 && typeof obj[key] === 'number') {
        this.rightSelectCtrl.patchValue(key, { emitEvent: false })
        this.rightNumberCtrl.patchValue(obj[key], { emitEvent: false })
      }
    })
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
}