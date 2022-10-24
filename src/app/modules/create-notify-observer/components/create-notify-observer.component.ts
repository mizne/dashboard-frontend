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
    {
      label: 'Twitter',
      value: NotifyObserverTypes.TWITTER,
    },
    {
      label: 'Twitter Space',
      value: NotifyObserverTypes.TWITTER_SPACE,
    },
    {
      label: 'Quest3',
      value: NotifyObserverTypes.QUEST3,
    },
  ];

  get isMedium(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.MEDIUM;
  }
  get isMirror(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.MIRROR;
  }
  get isTwitter(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.TWITTER;
  }
  get isTwitterSpace(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.TWITTER_SPACE;
  }
  get isQuest3(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.QUEST3;
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.patchForm();
  }

  toSearch() { }
  private patchForm() { }
}
