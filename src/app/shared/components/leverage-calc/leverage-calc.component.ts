import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

enum LeverageTypes {
  LP = 'lp',
  CEX = 'cex',
}

@Component({
  selector: 'leverage-calc',
  templateUrl: 'leverage-calc.component.html',
})
export class LeverageCalcComponent implements OnInit {
  constructor(private fb: FormBuilder) {}

  visible = false;

  types = [
    {
      label: 'alpaca杠杆(lp杠杆)',
      name: LeverageTypes.LP,
    },
    {
      label: 'cex杠杆',
      name: LeverageTypes.CEX,
    },
  ];

  form = this.fb.group({
    type: [this.types[0].name],
    capital: [1000],
    multiple: [3.0],
    openPrice: [1.0],
    takeProfit: [1.0],
    stopLossPrice: [1.0],
    debtRatioLimit: [0.8333],
  });

  profit = NaN;
  loss = NaN;
  liquidationPrice = NaN;

  ngOnInit() {
    this.form.valueChanges.subscribe(() => {
      this.profit = NaN;
      this.loss = NaN;
      this.liquidationPrice = NaN;
    });
  }

  submitForm(): void {
    this.profit = this.resolveProfitOrLoss(
      this.form.get('type')?.value as LeverageTypes,
      this.form.get('capital')?.value as number,
      this.form.get('multiple')?.value as number,
      this.form.get('openPrice')?.value as number,
      this.form.get('takeProfit')?.value as number
    );

    this.loss = this.resolveProfitOrLoss(
      this.form.get('type')?.value as LeverageTypes,
      this.form.get('capital')?.value as number,
      this.form.get('multiple')?.value as number,
      this.form.get('openPrice')?.value as number,
      this.form.get('stopLossPrice')?.value as number
    );

    this.liquidationPrice = this.resolveLiquidationPrice(
      this.form.get('type')?.value as LeverageTypes,
      this.form.get('capital')?.value as number,
      this.form.get('multiple')?.value as number,
      this.form.get('openPrice')?.value as number,
      this.form.get('debtRatioLimit')?.value as number
    );
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  private resolveLiquidationPrice(
    type: LeverageTypes,
    capital: number,
    multiple: number,
    openPrice: number,
    debtRatioLimit: number
  ) {
    const totalCapital = capital * multiple;
    const totalDebt = capital * (multiple - 1);
    const totalCapitalAfter = totalDebt / debtRatioLimit;

    return (
      openPrice * this.resolveAntiScale(totalCapitalAfter / totalCapital, type)
    );
  }

  private resolveProfitOrLoss(
    type: LeverageTypes,
    capital: number,
    multiple: number,
    openPrice: number,
    closePrice: number
  ): number {
    const totalCapital = capital * multiple;
    const totalDebt = capital * (multiple - 1);
    const totalCapitalAfter =
      totalCapital * this.resolveScale(closePrice / openPrice, type);
    return totalCapitalAfter - totalDebt - capital;
  }

  private resolveScale(scale: number, type: LeverageTypes) {
    switch (type) {
      case LeverageTypes.LP:
        return Math.sqrt(scale);
      case LeverageTypes.CEX:
        return scale;
      default:
        console.warn(`resolveScale() unknown type: ${type}`);
        return scale;
    }
  }

  private resolveAntiScale(scale: number, type: LeverageTypes) {
    switch (type) {
      case LeverageTypes.LP:
        return scale * scale;
      case LeverageTypes.CEX:
        return scale;
      default:
        console.warn(`resolveAntiScale() unknown type: ${type}`);
        return scale;
    }
  }
}
