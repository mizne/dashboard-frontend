import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NotifyObserverTypes } from 'src/app/shared';
import { CreateNotifyObserverService } from '../create-notify-observer.service';

@Component({
  selector: 'app-create-notify-observer',
  templateUrl: './create-notify-observer.component.html',
  styleUrls: ['./create-notify-observer.component.less'],
})
export class CreateNotifyObserverComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  types = [
    {
      label: 'Medium',
      value: NotifyObserverTypes.MEDIUM,
    },
    {
      label: 'Mirror',
      value: NotifyObserverTypes.MIRROR,
    },
  ];

  get isMedium(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.MEDIUM;
  }

  get isMirror(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.MIRROR;
  }

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private createNotifyObserverService: CreateNotifyObserverService
  ) {}

  ngOnInit(): void {
    this.patchForm();
  }

  toSearch() {}
  private patchForm() {}
}
