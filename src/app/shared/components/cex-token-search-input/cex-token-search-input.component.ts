import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { CexTokenService } from '../../services';
import { CexToken } from '../../models';
import { NzNotificationService } from 'ng-zorro-antd/notification';


export const CEX_TOKEN_SEARCH_INPUT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CexTokenSearchInputComponent),
  multi: true
};

@Component({
  selector: 'app-cex-token-search-input',
  templateUrl: './cex-token-search-input.component.html',
  providers: [CEX_TOKEN_SEARCH_INPUT_VALUE_ACCESSOR]
})
export class CexTokenSearchInputComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;

  selectedInputCtrl = new FormControl('');
  listOfOption: Array<CexToken> = [];
  nzFilterOption = (): boolean => true;

  isLoading = false;
  completed = false;
  pageNumber = 1;
  pageSize = 10;
  searchValue = '';

  private readonly searchSubject = new Subject<string>()
  private readonly searchObs = this.searchSubject.asObservable().pipe(
    debounceTime(2e3)
  )

  constructor(
    private readonly cexTokenService: CexTokenService,
    private readonly notification: NzNotificationService,
  ) { }

  ngOnInit(): void {
    this.selectedInputCtrl.valueChanges.subscribe(v => {
      this.emitValue()
    })

    this.searchObs.subscribe((value) => {
      this.handleSearch(value)
    })
  }

  search(value: string): void {
    this.searchSubject.next(value)
  }

  loadMore(): void {
    if (this.completed) {
      return
    }

    this.isLoading = true;
    this.pageNumber += 1;

    this.cexTokenService
      .queryList({
        symbol: {
          $regex: this.searchValue.trim(),
          $options: 'i',
        }
      }, { number: this.pageNumber, size: this.pageSize })
      .subscribe({
        next: data => {
          this.isLoading = false;
          this.listOfOption = [...this.listOfOption, ...data];

          if (data.length === 0) {
            this.completed = true;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.notification.error(`loadMore ${this.searchValue} Error`, `${err.message}`)
        }
      });
  }

  private handleSearch(value: string) {
    this.isLoading = true;
    this.completed = false;
    this.pageNumber = 1;
    this.searchValue = value;
    this.cexTokenService
      .queryList({
        symbol: {
          $regex: value.trim(),
          $options: 'i',
        }
      }, { number: this.pageNumber, size: this.pageSize })
      .subscribe({
        next: data => {
          this.isLoading = false;
          this.listOfOption = data;
        },
        error: (err) => {
          this.isLoading = false;
          this.notification.error(`HandleSearch ${value} Error`, `${err.message}`)
        }
      });
  }


  emitValue() {
    if (this.onChange) {
      this.onChange(this.selectedInputCtrl.value)
    }
  }

  ngOnDestroy(): void { }

  writeValue(obj: any): void {
    if (obj) {
      this.cexTokenService
        .queryList({
          symbol: {
            $regex: obj.trim(),
            $options: 'i',
          }
        }, { number: this.pageNumber, size: this.pageSize })
        .subscribe({
          next: data => {
            this.isLoading = false;
            this.listOfOption = data;
            if (data.length > 0) {
              this.selectedInputCtrl.patchValue(data[0].symbol)
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.notification.error(`writeValue ${obj} Error`, `${err.message}`)
          }
        });
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