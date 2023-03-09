import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-timer',
  templateUrl: './timer.component.html',
})
export class CreateTimerComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});
  @Input() action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE

  constructor(private fb: FormBuilder) { }

  timerMessage = '00:00 到 01:00 为服务维护时间，不建议在此时间段内设置定时任务'

  ngOnInit(): void {
  }
}
