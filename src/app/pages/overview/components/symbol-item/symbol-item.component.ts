import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { Observable, map, forkJoin, firstValueFrom } from 'rxjs';
import { CexTokenCacheService } from 'src/app/shared';
import { CexTokenTagCacheService } from 'src/app/shared';

@Component({
  selector: 'symbol-item',
  templateUrl: 'symbol-item.component.html',
})
export class SymbolItemComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexTokenCacheService: CexTokenCacheService,
    private readonly cexTokenTagCacheService: CexTokenTagCacheService
  ) { }

  @Input() symbol = '';

  @Input() content: TemplateRef<any> | null = null;

  slug = '';
  name = '';
  fullname = '';
  logoName = '';
  marketCap = 0;

  website = '';
  twitter = '';

  tagLabels: string[] = [];

  templateContext: { [key: string]: any } = {};

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    const symbol = changes['symbol'] && changes['symbol'].currentValue;
    if (symbol) {
      this.templateContext = {
        $implicit: this.symbol,
      };
      this.cexTokenCacheService.queryBySymbol(symbol).subscribe((token) => {
        if (token) {
          this.templateContext['slug'] = this.slug = token.slug || '';
          this.templateContext['name'] = this.name = token.name || '';
          this.templateContext['fullname'] = this.fullname =
            token.fullname || '';
          this.templateContext['logoName'] = this.logoName =
            token.logoName || '';
          this.templateContext['marketCap'] = this.marketCap =
            token.marketCap || 0;

          this.templateContext['website'] = this.website = token.website || '';
          this.templateContext['twitter'] = this.twitter = token.twitter || '';

          if (token.tags && token.tags.length > 0) {
            Promise.all(token.tags.map((e) => this.resolveTagLabel(e))).then(
              (labels) => {
                this.templateContext['tagLabels'] = this.tagLabels = labels;
              }
            );
          }
        } else {
          console.warn(`symbol: ${symbol} token: `, token);
        }
      });
    }
  }

  private resolveTagLabel(tagName: string): Promise<string> {
    return firstValueFrom(
      this.cexTokenTagCacheService
        .queryByName(tagName)
        .pipe(map((tag) => (tag ? tag.label : '')))
    );
  }
}
