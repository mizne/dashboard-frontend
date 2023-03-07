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
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
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

  tags: Array<number | string> = [];
  inputVisible = false;
  inputValue = null;

  @Input() min = 0;
  @Input() max = 999;

  @Input() type: 'number' | 'text' = 'number'

  @ViewChild('inputNumber') inputNumberCom: NzInputNumberComponent | null = null;
  @ViewChild('inputText') inputTextCom: ElementRef<HTMLInputElement> | null = null;

  constructor() { }

  handleClose(removedTag: string | number, theIndex: number): void {
    this.tags = this.tags.filter((tag, index) => index !== theIndex);
    this.emitValue()
  }

  showInput(): void {
    this.inputVisible = true;

    setTimeout(() => {
      if (this.inputNumberCom) {
        this.inputNumberCom.focus();
      }

      if (this.inputTextCom) {
        this.inputTextCom.nativeElement.focus();
      }
    }, 10)
  }

  handleInputConfirm(): void {
    // console.log(`handleInputConfirm() ${this.inputValue}`)
    if (this.type === 'number' && typeof this.inputValue === 'number' && this.tags.indexOf(this.inputValue) === -1) {
      this.tags = [...this.tags, this.inputValue];
      this.emitValue();
    }

    if (this.type === 'text' && typeof this.inputValue === 'string' && this.tags.indexOf(this.inputValue) === -1) {
      this.tags = [...this.tags, this.inputValue];
      this.emitValue();
    }

    this.inputValue = null;
    this.inputVisible = false;
  }

  emitValue() {
    // console.log(`emitValue() tags: `, this.tags)
    if (this.onChange) {
      this.onChange(this.tags)
    }
  }

  ngOnDestroy(): void { }

  writeValue(value: number[]): void {
    if (value && Array.isArray(value)) {
      this.tags = value;
    } else {
      this.tags = [];
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