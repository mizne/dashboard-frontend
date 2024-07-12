import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { merge, Subscription } from 'rxjs';

export const MULTI_CHART_FILTER_INPUT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MultiChartFilterInputComponent),
  multi: true
};

@Component({
  selector: 'app-multi-chart-filter-input',
  templateUrl: './multi-chart-filter-input.component.html',
  providers: [MULTI_CHART_FILTER_INPUT_VALUE_ACCESSOR]
})
export class MultiChartFilterInputComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;


  ctrls: FormControl[] = []
  subscription: Subscription = Subscription.EMPTY

  constructor(
  ) { }

  ngOnInit(): void {


    this.listenCtrlsChange()
  }

  add() {
    this.ctrls.push(new FormControl())
    this.listenCtrlsChange();
    this.emitValue()
  }

  remove(ctrl: FormControl) {
    const index = this.ctrls.indexOf(ctrl);
    if (index >= 0) {
      this.ctrls.splice(index, 1)
      this.listenCtrlsChange();
      this.emitValue()
    }
  }

  emitValue() {
    if (this.onChange) {
      this.onChange(this.resolveValue())
    }
  }

  private resolveValue() {
    return this.ctrls.map(e => e.value).filter(e => !!e)
  }

  private listenCtrlsChange() {
    this.subscription.unsubscribe();
    this.subscription = merge(
      ...this.ctrls.map(e => e.valueChanges)
    ).subscribe(() => {
      this.emitValue()
    })
  }

  ngOnDestroy(): void { }

  writeValue(obj: any): void {
    if (!Array.isArray(obj)) {
      this.ctrls = []
      this.listenCtrlsChange()
      return
    }

    this.ctrls = obj.map(e => new FormControl(e))
    this.listenCtrlsChange()
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