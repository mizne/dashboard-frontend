import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-link3',
  templateUrl: './link3.component.html',
})
export class CreateLink3Component implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});
  @Input() action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }
}
