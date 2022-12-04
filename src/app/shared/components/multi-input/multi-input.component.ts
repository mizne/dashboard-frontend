import {
  Component,
  TemplateRef,
  StaticProvider,
  forwardRef,
  OnDestroy,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as uuid from 'uuid';


export const MULTI_INPUT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MultiInputComponent),
  multi: true
};

@Component({
  selector: 'app-multi-input',
  templateUrl: './multi-input.component.html',
  styles: [
    `
      .editable-tag {
        background: rgb(255, 255, 255);
        border-style: dashed;
      }
    `
  ],
  providers: [MULTI_INPUT_VALUE_ACCESSOR]
})
export class MultiInputComponent implements ControlValueAccessor, OnDestroy {
  private onChange: Function | null = null;
  public id = uuid.v4();

  tags: number[] = [];
  inputVisible = false;
  inputValue = null;

  @Input() min = 0;
  @Input() max = 999;

  constructor() { }

  handleClose(removedTag: {}): void {
    this.tags = this.tags.filter(tag => tag !== removedTag);
    this.emitValue()
  }

  showInput(): void {
    this.inputVisible = true;
  }

  handleInputConfirm(): void {
    console.log(`handleInputConfirm() ${this.inputValue}`)
    if (typeof this.inputValue === 'number' && this.tags.indexOf(this.inputValue) === -1) {
      this.tags = [...this.tags, this.inputValue];
      this.emitValue();
    }
    this.inputValue = null;
    this.inputVisible = false;
  }

  emitValue() {
    console.log(`emitValue() tags: `, this.tags)
    if (this.onChange) {
      this.onChange(this.tags)
    }
  }

  ngOnDestroy(): void { }

  writeValue(value: number[]): void {
    if (value && Array.isArray(value)) {
      this.tags = value;
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