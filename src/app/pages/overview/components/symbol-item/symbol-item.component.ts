import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CexTokenCacheService } from '../../services/cex-token-cache.service';

@Component({
  selector: 'symbol-item',
  templateUrl: 'symbol-item.component.html',
})
export class SymbolItemComponent implements OnInit, OnChanges {
  constructor(private readonly cexTokenCacheService: CexTokenCacheService) {}

  @Input() prefix = '';
  @Input() symbol = '';

  slug = '';

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    const symbol = changes['symbol'] && changes['symbol'].currentValue;
    if (symbol) {
      this.cexTokenCacheService.queryBySymbol(symbol).subscribe((token) => {
        if (token) {
          this.slug = token.slug || '';
        }
      });
    }
  }
}
