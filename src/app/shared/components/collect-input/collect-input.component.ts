import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const COLLECT_INPUT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CollectInputComponent),
  multi: true
};

@Component({
  selector: 'app-collect-input',
  templateUrl: './collect-input.component.html',
  providers: [COLLECT_INPUT_VALUE_ACCESSOR]
})
export class CollectInputComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;

  hasCollect: boolean = false;

  constructor(
  ) { }

  ngOnInit(): void {

  }

  changeCollet() {
    this.hasCollect = !this.hasCollect;
    this.emitValue();
  }

  emitValue() {
    if (this.onChange) {
      this.onChange(this.hasCollect)
    }
  }

  ngOnDestroy(): void { }

  writeValue(hasCollect: boolean): void {
    if (hasCollect) {
      this.hasCollect = true
    } else {
      this.hasCollect = false
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
}