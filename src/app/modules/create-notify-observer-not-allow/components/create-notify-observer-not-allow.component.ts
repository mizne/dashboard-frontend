import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NotifyObserverNotAllowService, NotifyObserverTypes } from 'src/app/shared';

@Component({
  selector: 'app-create-notify-observer-not-allow',
  templateUrl: './create-notify-observer-not-allow.component.html',
  styleUrls: ['./create-notify-observer-not-allow.component.less'],
})
export class CreateNotifyObserverNotAllowComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  types: Array<{ label: string; value: NotifyObserverTypes }> = [];

  constructor(private fb: FormBuilder, private service: NotifyObserverNotAllowService) { }

  ngOnInit(): void {
    this.patchForm();

    this.service.queryTypes()
      .subscribe(types => {
        this.types = types;
      })
  }

  toSearch() { }
  private patchForm() { }
}
