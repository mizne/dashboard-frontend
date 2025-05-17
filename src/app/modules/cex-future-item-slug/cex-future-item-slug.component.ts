import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Component({
  selector: 'cex-future-item-slug',
  templateUrl: 'cex-future-item-slug.component.html'
})
export class CexFutureItemSlugComponent implements OnInit {
  constructor(
    private readonly notification: NzNotificationService,
  ) { }

  @Input() content: TemplateRef<any> | null = null;

  @Input() symbol = 'BTCUSDT'
  @Input() slug: string | undefined = ''
  @Input() openInterestMultiple: number | undefined = 1
  @Output() update = new EventEmitter<{ slug: string | undefined; openInterestMultiple: number | undefined }>()

  futureDetailModalVisible = false;
  futureDetailModalTitle = '';

  slugCtrl = new FormControl(this.slug)
  openInterestMultipleCtrl = new FormControl(this.openInterestMultiple)

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.slugCtrl.patchValue(this.slug)
    this.openInterestMultipleCtrl.patchValue(this.openInterestMultiple)
  }

  open() {
    this.futureDetailModalVisible = true;
  }

  ensure() {
    this.update.emit({
      slug: this.slugCtrl.value as string,
      openInterestMultiple: this.openInterestMultipleCtrl.value as number,
    })
  }
}