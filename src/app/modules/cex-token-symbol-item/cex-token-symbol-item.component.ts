import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { map, firstValueFrom, lastValueFrom } from 'rxjs';
import { CexTokenCacheService, CexTokenService } from 'src/app/shared';
import { CexTokenTagCacheService } from 'src/app/shared';

@Component({
  selector: 'cex-token-symbol-item',
  templateUrl: 'cex-token-symbol-item.component.html',
})
export class CexTokenSymbolItemComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexTokenCacheService: CexTokenCacheService,
    private readonly cexTokenService: CexTokenService,
    private readonly cexTokenTagCacheService: CexTokenTagCacheService,
    private readonly nzNotificationService: NzNotificationService,
  ) { }

  @Input() symbol = '';
  @Input() name = '';

  @Input() content: TemplateRef<any> | null = null;

  _cexTokenID = ''
  _symbol = '';
  _slug = '';
  _name = '';
  _fullname = '';
  _logoName = '';
  _marketCap = 0;
  _marketCapRanking = 0;
  _createdAt = 0;

  _website = '';
  _twitter = '';

  _circulatingSupply = 0;
  _totalSupply = 0;
  _supplyPercent = 0;

  _tagLabels: string[] = [];

  hasCollectCtrl = new FormControl(false)

  templateContext: { [key: string]: any } = {};

  ngOnInit() {
    this.hasCollectCtrl.valueChanges.subscribe(v => {
      this.updateHasCollect(!!v)
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    const symbol = changes['symbol'] && changes['symbol'].currentValue;
    const name = changes['name'] && changes['name'].currentValue;
    if (symbol) {
      this.templateContext = {
        $implicit: this.symbol,
      };
      this._symbol = symbol;
      this.fetchToken(symbol)
    }

    if (name) {
      this.templateContext = {
        $implicit: this.name,
      };
      this._name = name;
      this.fetchToken('', name)
    }
  }

  private fetchToken(symbol?: string, name?: string) {
    (symbol ? this.cexTokenCacheService.queryBySymbol(symbol) : this.cexTokenCacheService.queryByName(name as string)).subscribe((token) => {
      if (token) {
        this.templateContext['id'] = this._cexTokenID = token._id;
        this.templateContext['symbol'] = this._symbol = token.symbol || '';
        this.templateContext['slug'] = this._slug = token.slug || '';
        this.templateContext['name'] = this._name = token.name || '';
        this.templateContext['fullname'] = this._fullname =
          token.fullname || '';
        this.templateContext['logoName'] = this._logoName =
          token.logoName || '';
        this.templateContext['marketCap'] = this._marketCap =
          token.marketCap || 0;
        this.templateContext['marketCapRanking'] = this._marketCapRanking =
          token.marketCapRanking || 0;
        this.templateContext['createdAt'] = this._createdAt =
          token.createdAt || 0;

        this.templateContext['website'] = this._website = token.website || '';
        this.templateContext['twitter'] = this._twitter = token.twitter || '';

        this.templateContext['circulatingSupply'] = this._circulatingSupply = token.circulatingSupply || 0;
        this.templateContext['totalSupply'] = this._totalSupply = token.totalSupply || 0;
        if (this._circulatingSupply > 0 && this._totalSupply > 0) {
          this._supplyPercent = Number(((this._circulatingSupply * 100) / this._totalSupply).toFixed(1))
        }

        if (token.tags && token.tags.length > 0) {
          Promise.all(token.tags.map((e) => this.resolveTagLabel(e))).then(
            (labels) => {
              this.templateContext['tagLabels'] = this._tagLabels = labels;
            }
          );
        }

        this.hasCollectCtrl.patchValue(!!token.hasCollect, { emitEvent: false })
      } else {
        this._symbol = symbol || name || '';
        console.warn(`[CexTokenSymbolItemComponent.ts] not found token by name: ${name} symbol: ${symbol}`);
      }
    });
  }

  private resolveTagLabel(tagName: string): Promise<string> {
    return lastValueFrom(
      this.cexTokenTagCacheService
        .queryByName(tagName)
        .pipe(map((tag) => (tag ? tag.label : '')))
    );
  }

  private updateHasCollect(hasCollect: boolean) {
    if (this._cexTokenID) {

      this.cexTokenService.update(this._cexTokenID, { hasCollect: !!hasCollect })
        .subscribe({
          next: () => {
            this.nzNotificationService.success(`${hasCollect ? '收藏' : '取消收藏'} ${this._symbol} 成功`, `${hasCollect ? '收藏' : '取消收藏'} ${this._symbol} 成功`)
            this.cexTokenCacheService.markRefreshCache()
          },
          error: (err) => {
            this.nzNotificationService.error(`${hasCollect ? '收藏' : '取消收藏'} ${this._symbol} 失败`, `${err.message}`)
            this.hasCollectCtrl.patchValue(!hasCollect, { emitEvent: false })
          }
        })
    }
  }
}
