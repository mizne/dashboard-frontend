import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-ghost',
  templateUrl: './ghost.component.html',
})
export class CreateGhostComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});
  @Input() action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }
}
