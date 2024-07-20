import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MAX_GENERAL_TABLE_FIELD_COUNT, NotifyObserverService, SharedService } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-price-change',
  templateUrl: './price-change.component.html',
})
export class CreatePriceChangeComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});
  @Input() action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private notification: NzNotificationService,
    private notifyObserverService: NotifyObserverService
  ) { }

  priceChangeTypes: Array<any> = []

  ngOnInit(): void {
    this.loadPriceChangeTypes()
  }


  private loadPriceChangeTypes() {
    this.notifyObserverService.queryPriceChangeTypes()
      .subscribe(items => {
        this.priceChangeTypes = items
      })
  }
}
