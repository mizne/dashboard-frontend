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
import { CexTokenCacheService, CexTokenPriceChangeService, CexTokenService, NotifyObserver, NotifyObserverService, NotifyObserverTypes } from 'src/app/shared';
import { CexTokenTagCacheService } from 'src/app/shared';
import { CreateNotifyObserverService, NotifyObserverModalActions } from 'src/app/modules/create-notify-observer'

@Component({
  selector: 'cex-token-symbol-item',
  templateUrl: 'cex-token-symbol-item.component.html',
})
export class CexTokenSymbolItemComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexTokenCacheService: CexTokenCacheService,
    private readonly cexTokenService: CexTokenService,
    private readonly cexTokenPriceChangeService: CexTokenPriceChangeService,
    private readonly notifyObserverService: NotifyObserverService,
    private readonly cexTokenTagCacheService: CexTokenTagCacheService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly createNotifyObserverService: CreateNotifyObserverService,
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
  _listingTime = 0;

  _website = '';
  _twitter = '';

  _circulatingSupply = 0;
  _totalSupply = 0;
  _supplyPercent = 0;

  _tagLabels: string[] = [];

  hasCollectCtrl = new FormControl(false)

  templateContext: { [key: string]: any } = {};

  notifyObservers: NotifyObserver[] = []

  cexTokenPriceChangeTags: Array<{
    label: string;
    value: string;
    color: string;
  }> = []
  fetchCexTokenPriceChangeTags = false

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

  popoverVisibleChange(visible: boolean) {
    console.log(`popoverVisibleChange: `, visible);

    if (visible && this._symbol) {
      this.fetchCexTokenPriceChange()
    }
  }

  private async fetchCexTokenPriceChange() {
    this.fetchCexTokenPriceChangeTags = true
    const days = [3, 7, 15, 30, 60, 90, 180, 360, 540];
    const results = []
    for (const day of days) {
      const items = await (lastValueFrom(this.cexTokenPriceChangeService.queryList({ symbol: this._symbol, inDays: day }, { number: 1, size: 1 })))
      if (items.length === 1) {
        results.push({
          label: `${day} 天`,
          value: `${(items[0].priceChangePercent * 100).toFixed(1)} %`,
          color: this.resolvePriceChangeColor(items[0].priceChangePercent)
        })
      }
    }

    this.cexTokenPriceChangeTags = results
    this.fetchCexTokenPriceChangeTags = false
  }

  private resolvePriceChangeColor(priceChangePercent: number): string {
    if (priceChangePercent <= -0.9) {
      return '#7C0902'
    } else if (priceChangePercent > -0.9 && priceChangePercent <= -0.5) {
      return '#AB274F'
    } else if (priceChangePercent > -0.5 && priceChangePercent <= -0.2) {
      return '#FE6F5E'
    } else if (priceChangePercent > -0.2 && priceChangePercent <= 0) {
      return '#FDBCB4'
    } else if (priceChangePercent > 0 && priceChangePercent <= 1.0) {
      return '#ACE1AF'
    } else if (priceChangePercent > 1.0 && priceChangePercent <= 5.0) {
      return '#50C878'
    } else if (priceChangePercent > 5.0 && priceChangePercent <= 10.0) {
      return '#177245'
    } else {
      return '#013220'
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
        this.templateContext['listingTime'] = this._listingTime =
          token.listingTime || 0;

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

        this.hasCollectCtrl.patchValue(!!token.hasCollect, { emitEvent: false });

        this.fetchPriceChangeNotifyObservers()
      } else {
        this._symbol = symbol || name || '【缓存未命中】';
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

  private async fetchPriceChangeNotifyObservers() {
    if (this._symbol) {
      const notifyObservers = await lastValueFrom(this.notifyObserverService.queryList({
        type: NotifyObserverTypes.PRICE_CHANGE,
        priceChangeCexTokenSymbol: this._symbol
      }))

      this.notifyObservers = notifyObservers
    }
  }

  confirmAdd() {
    const { success, error } = this.createNotifyObserverService.createModal(`添加通知源`, {
      type: NotifyObserverTypes.PRICE_CHANGE,
      notifyShowTitle: `${this._symbol} 价格通知`,
      enableTelegram: true,
      priceChangeCexTokenSymbol: this._symbol
    }, NotifyObserverModalActions.CREATE)
    success.subscribe((v) => {
      this.nzNotificationService.success(
        `添加通知源 成功`,
        `添加通知源 成功`
      );
      this.fetchPriceChangeNotifyObservers()
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加通知源 失败`, `${e.message}`);
    });
  }

  confirmUpdate(item: NotifyObserver) {
    const { success, error } = this.createNotifyObserverService.createModal(`修改通知源`, item, NotifyObserverModalActions.UPDATE)
    success.subscribe((v) => {
      this.nzNotificationService.success(
        `修改通知源 成功`,
        `修改通知源 成功`
      );
      this.fetchPriceChangeNotifyObservers()
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`修改通知源 失败`, `${e.message}`);
    });
  }
  confirmDelete(item: NotifyObserver) {
    this.notifyObserverService.deleteByID(item._id as string)
      .subscribe({
        next: () => {
          this.nzNotificationService.success(`删除通知源 成功`, `删除通知源 成功`);
          this.fetchPriceChangeNotifyObservers()
        },
        error: (err) => {
          this.nzNotificationService.error(`删除通知源 失败`, `${err.message}`);
        }
      })
  }
  cancelDelete(item: NotifyObserver) { }
}
