import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CexTokenTagService } from '../../services/cex-token-tag.service';
import { tokenTagNameOfTotalMarket } from '../../models/cex-token-tag.model';

export const CEX_TOKEN_TAG_SELECT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CexTokenTagSelectComponent),
  multi: true
};

@Component({
  selector: 'app-cex-token-tag-select',
  templateUrl: './cex-token-tag-select.component.html',
  styleUrls: ['./cex-token-tag-select.component.less'],
  providers: [CEX_TOKEN_TAG_SELECT_VALUE_ACCESSOR]
})
export class CexTokenTagSelectComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;

  tags: Array<{ label: string; name: string }> = [];
  tagCtrl = new FormControl('');
  loading = false;

  constructor(
    private readonly cexTokenTagService: CexTokenTagService,
  ) { }

  ngOnInit(): void {
    this.loadTags();

    this.tagCtrl.valueChanges.subscribe(v => {
      this.emitValue()
    })
  }


  emitValue() {
    if (this.onChange) {
      this.onChange(this.tagCtrl.value || null)
    }
  }

  ngOnDestroy(): void { }

  writeValue(tagName: string): void {
    if (tagName) {
      this.tagCtrl.patchValue(tagName, { emitEvent: false })
    } else {
      this.tagCtrl.patchValue('', { emitEvent: false })
    }
  }

  private loadTags() {
    this.loading = true
    this.cexTokenTagService.queryList().subscribe((items) => {
      this.loading = false;
      this.tags = [{ label: '全部', name: '' }].concat(
        items
          .map((e) => ({ label: e.label, name: e.name }))
          .filter((e) => e.name !== tokenTagNameOfTotalMarket)
      );
    });
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