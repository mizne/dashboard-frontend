import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge } from 'rxjs';

export const CHART_FILTER_INPUT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ChartFilterInputComponent),
  multi: true
};

@Component({
  selector: 'app-chart-filter-input',
  templateUrl: './chart-filter-input.component.html',
  providers: [CHART_FILTER_INPUT_VALUE_ACCESSOR]
})
export class ChartFilterInputComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;


  labelCtrl = new FormControl('')
  filterCtrl = new FormControl()
  colorCtrl = new FormControl()

  constructor(
  ) { }

  ngOnInit(): void {
    merge(
      this.labelCtrl.valueChanges,
      this.filterCtrl.valueChanges,
      this.colorCtrl.valueChanges,
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

    if (this.labelCtrl.value) {
      Object.assign(obj, {
        label: this.labelCtrl.value
      })
    }

    if (this.filterCtrl.value) {
      Object.assign(obj, {
        filter: this.filterCtrl.value
      })
    }

    if (this.colorCtrl.value) {
      Object.assign(obj, {
        color: this.colorCtrl.value
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
      this.labelCtrl.patchValue(null, { emitEvent: false })
      this.filterCtrl.patchValue(null, { emitEvent: false })
      this.colorCtrl.patchValue(null, { emitEvent: false })
      return
    }

    const keys = Object.keys(obj);
    keys.forEach(key => {
      if (key === 'label') {
        this.labelCtrl.patchValue(obj[key], { emitEvent: false })
      }

      if (key === 'filter') {
        this.filterCtrl.patchValue(obj[key], { emitEvent: false })
      }

      if (key === 'color') {
        this.colorCtrl.patchValue(obj[key], { emitEvent: false })
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