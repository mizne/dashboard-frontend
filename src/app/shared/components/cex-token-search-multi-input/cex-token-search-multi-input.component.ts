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


export const CEX_TOKEN_SEARCH_MULTI_INPUT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CexTokenSearchMultiInputComponent),
  multi: true
};

@Component({
  selector: 'app-cex-token-search-multi-input',
  templateUrl: './cex-token-search-multi-input.component.html',
  providers: [CEX_TOKEN_SEARCH_MULTI_INPUT_VALUE_ACCESSOR]
})
export class CexTokenSearchMultiInputComponent implements ControlValueAccessor, OnDestroy, OnInit {
  private onChange: Function | null = null;

  selectedInputCtrl: FormControl<any> = new FormControl(null);
  listOfOption: Array<CexToken> = [];
  nzFilterOption = (): boolean => true;

  isLoading = false;
  completed = false;
  pageNumber = 1;
  pageSize = 10;
  searchValue = '';

  private readonly searchSubject = new Subject<string>()
  private readonly searchObs = this.searchSubject.asObservable().pipe(
    debounceTime(1.5 * 1e3)
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

  writeValue(symbols: any): void {
    if (Array.isArray(symbols)) {
      if (symbols.length === 0) {
        this.selectedInputCtrl.patchValue([], { emitEvent: false })
      } else {
        this.cexTokenService
          .queryList({
            symbol: { $in: symbols }
          })
          .subscribe({
            next: data => {
              this.isLoading = false;
              const originalSortedCexTokens = symbols.map(e => data.find(f => f.symbol === e)).filter(e => !!e) as CexToken[]
              this.listOfOption = originalSortedCexTokens;
              if (originalSortedCexTokens.length > 0) {
                this.selectedInputCtrl.patchValue(originalSortedCexTokens.map(e => e.symbol), { emitEvent: false })
              }
            },
            error: (err) => {
              this.isLoading = false;
              this.notification.error(`writeValue ${symbols} Error`, `${err.message}`)
            }
          });
      }
    } else {
      this.selectedInputCtrl.patchValue([], { emitEvent: false })
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