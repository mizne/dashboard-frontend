import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Time, PriceScaleMode } from 'lightweight-charts';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexFutureDailyService, CexFutureService, TradingViewChartTypes, TradingViewSeries } from 'src/app/shared';


@Component({
  selector: 'cex-future-item-liquidation-notification',
  templateUrl: 'cex-future-item-liquidation-notification.component.html'
})
export class CexFutureItemLiquidationNotificationComponent implements OnInit {
  constructor(
    private readonly notification: NzNotificationService,
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  @Input() symbol = 'BTCUSDT'
  @Input() enableLiquidationNotification: boolean | undefined = false;
  @Input() liquidationAmountLimit: number | undefined = 1e3;
  @Output() update = new EventEmitter<{ symbol: string; enableLiquidationNotification: boolean; liquidationAmountLimit: number }>()

  futureDetailModalVisible = false;
  futureDetailModalTitle = '';

  enableLiquidationNotificationCtrl = new FormControl(this.enableLiquidationNotification)
  liquidationAmountLimitCtrl = new FormControl(this.liquidationAmountLimit)

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.enableLiquidationNotificationCtrl.patchValue(this.enableLiquidationNotification)
    this.liquidationAmountLimitCtrl.patchValue(this.liquidationAmountLimit)
  }

  open() {
    if (!this.symbol) {
      this.notification.error(`查看清算通知失败`, `没有symbol`)
      return
    }
    this.futureDetailModalVisible = true;
  }

  ensure() {
    this.update.emit({
      symbol: this.symbol,
      enableLiquidationNotification: this.enableLiquidationNotificationCtrl.value as boolean,
      liquidationAmountLimit: this.liquidationAmountLimitCtrl.value as number
    })
  }
}