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
import { CexFutureCacheService, CexFutureService } from 'src/app/shared';

@Component({
  selector: 'cex-future-symbol-item',
  templateUrl: 'cex-future-symbol-item.component.html',
})
export class CexFutureSymbolItemComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexFutureCacheService: CexFutureCacheService,
    private readonly cexFutureService: CexFutureService,
    private readonly nzNotificationService: NzNotificationService
  ) { }

  @Input() symbol = '';

  @Input() content: TemplateRef<any> | null = null;

  _cexFutureID = ''
  _symbol = '';
  _slug = '';
  _logoName = '';
  _marketCap = 0;
  _fullyDilutedMarketCap = 0;
  _createdAt = 0;

  _website = '';
  _twitter = '';

  _circulatingSupply = 0;
  _totalSupply = 0;
  _supplyPercent = 0;


  hasCollectCtrl = new FormControl(false)

  templateContext: { [key: string]: any } = {};


  ngOnInit() {
    this.hasCollectCtrl.valueChanges.subscribe(v => {
      this.updateHasCollect(!!v)
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    const symbol = changes['symbol'] && changes['symbol'].currentValue;
    if (symbol) {
      this.templateContext = {
        $implicit: this.symbol,
      };
      this._symbol = symbol;
      this.fetchCexFuture(symbol)
    }
  }

  popoverVisibleChange(visible: boolean) {
    console.log(`popoverVisibleChange: `, visible);


  }


  private fetchCexFuture(symbol: string) {
    (this.cexFutureCacheService.queryBySymbol(symbol)).subscribe((token) => {
      if (token) {
        this.templateContext['id'] = this._cexFutureID = token._id;
        this.templateContext['symbol'] = this._symbol = token.symbol || '';
        this.templateContext['slug'] = this._slug = token.slug || '';
        this.templateContext['logoName'] = this._logoName =
          token.logoName || '';
        this.templateContext['marketCap'] = this._marketCap =
          token.marketCap || 0;

        this.templateContext['fullyDilutedMarketCap'] = this._fullyDilutedMarketCap =
          token.fullyDilutedMarketCap || 0;
        this.templateContext['createdAt'] = this._createdAt =
          token.createdAt || 0;

        this.templateContext['website'] = this._website = token.website || '';
        this.templateContext['twitter'] = this._twitter = token.twitter || '';

        this.templateContext['circulatingSupply'] = this._circulatingSupply = token.circulatingSupply || 0;
        this.templateContext['totalSupply'] = this._totalSupply = token.totalSupply || 0;
        if (this._circulatingSupply > 0 && this._totalSupply > 0) {
          this._supplyPercent = Number(((this._circulatingSupply * 100) / this._totalSupply).toFixed(1))
        }

        this.hasCollectCtrl.patchValue(!!token.hasCollect, { emitEvent: false });
      } else {
        this._symbol = symbol || name || '【缓存未命中】';
        console.warn(`[CexFutureSymbolItemComponent.ts] not found cex future by symbol: ${symbol}`);
      }
    });
  }



  private updateHasCollect(hasCollect: boolean) {
    if (this._cexFutureID) {

      this.cexFutureService.update(this._cexFutureID, { hasCollect: !!hasCollect })
        .subscribe({
          next: () => {
            this.nzNotificationService.success(`${hasCollect ? '收藏' : '取消收藏'} ${this._symbol} 成功`, `${hasCollect ? '收藏' : '取消收藏'} ${this._symbol} 成功`)
            this.cexFutureCacheService.markRefreshCache()
          },
          error: (err) => {
            this.nzNotificationService.error(`${hasCollect ? '收藏' : '取消收藏'} ${this._symbol} 失败`, `${err.message}`)
            this.hasCollectCtrl.patchValue(!hasCollect, { emitEvent: false })
          }
        })
    }
  }


}
