import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'cex-token-price-change-statistics',
  templateUrl: 'cex-token-price-change-statistics.component.html'
})
export class CexTokenPriceChangeStatisticsComponent {
  constructor(

  ) { }

  @Input() content: TemplateRef<any> | null = null;

  visible = false;

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }
}