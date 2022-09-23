import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Observable, map, forkJoin } from 'rxjs';
import { CexTokenCacheService } from '../../services/cex-token-cache.service';
import { CexTokenTagCacheService } from '../../services/cex-token-tag-cache.service';

@Component({
  selector: 'symbol-item',
  templateUrl: 'symbol-item.component.html',
})
export class SymbolItemComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexTokenCacheService: CexTokenCacheService,
    private readonly cexTokenTagCacheService: CexTokenTagCacheService
  ) {}

  @Input() prefix = '';
  @Input() symbol = '';

  slug = '';
  name = '';
  fullname = '';
  logoName = '';

  tagLabels: string[] = [];

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    const symbol = changes['symbol'] && changes['symbol'].currentValue;
    if (symbol) {
      this.cexTokenCacheService.queryBySymbol(symbol).subscribe((token) => {
        if (token) {
          this.slug = token.slug || '';
          this.name = token.name || '';
          this.fullname = token.fullname || '';
          this.logoName = token.logoName || '';

          if (token.tags && token.tags.length > 0) {
            forkJoin(token.tags.map((e) => this.resolveTagLabel(e))).subscribe(
              (labels) => {
                this.tagLabels = labels;
              }
            );
          }
        }
      });
    }
  }

  private resolveTagLabel(tagName: string): Observable<string> {
    return this.cexTokenTagCacheService
      .queryByName(tagName)
      .pipe(map((tag) => (tag ? tag.label : '')));
  }
}
