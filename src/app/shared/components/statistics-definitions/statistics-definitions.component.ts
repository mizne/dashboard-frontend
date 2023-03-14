import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { isEmpty, randomString } from 'src/app/utils';


export const STATISTICS_DEFINITIONS_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => StatisticsDefinitionsComponent),
  multi: true
};

interface Definition {
  name: string;
  version: number;
  fields: string[]
}

@Component({
  selector: 'app-statistics-definitions',
  templateUrl: './statistics-definitions.component.html',
  providers: [STATISTICS_DEFINITIONS_VALUE_ACCESSOR]
})
export class StatisticsDefinitionsComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;

  definitions: Array<Definition> = [];

  showModal = false;
  nameCtrl = new FormControl(null);
  createForm = this.fb.group({
    name: [null],
    fields: [[]]
  })

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
  ) { }

  ngOnInit(): void {

  }

  addDefinition() {
    this.showModal = true;
  }

  confirmDelete(item: Definition) {
    const index = this.definitions.indexOf(item);
    if (index >= 0) {
      this.definitions.splice(index, 1);
    }

    this.emitValue();
  }

  confirmAdd() {
    if (!this.createForm.value.name) {
      this.notification.warning(`还没有填写 表名`, `还没有填写 表名`);
      return
    }

    if (!this.createForm.value.fields || this.createForm.value.fields.length === 0) {
      this.notification.warning(`还没有填写 字段`, `还没有填写 字段`);
      return
    }

    this.showModal = false;
    const lastDefinition = this.definitions.length > 0 ? this.definitions[this.definitions.length - 1] : null
    this.definitions.push({
      name: (this.createForm.value.name || '') + ' - ' + randomString(4),
      version: lastDefinition ? lastDefinition.version + 1 : 1,
      fields: this.createForm.value.fields || []
    })

    this.emitValue();
  }


  emitValue() {
    if (this.onChange) {
      this.onChange(this.definitions.map(e => ({
        name: e.name,
        version: e.version,
        fields: e.fields
      })));
    }
  }

  ngOnDestroy(): void { }

  writeValue(obj: any): void {
    if (Array.isArray(obj) && obj.length > 0) {
      this.definitions = obj.map(e => ({
        name: e.name,
        version: e.version,
        fields: e.fields
      }));
    } else {
      this.definitions = [];
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