import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NotifyObserverService, NotifyObserverTypes } from 'src/app/shared';
import { CreateNotifyObserverService } from '../create-notify-observer.service';

@Component({
  selector: 'app-create-notify-observer',
  templateUrl: './create-notify-observer.component.html',
  styleUrls: ['./create-notify-observer.component.less'],
})
export class CreateNotifyObserverComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});
  @Input() disabledType = false

  types: Array<{ label: string; value: NotifyObserverTypes }> = [];

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
  get isGalxe(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.GALXE;
  }
  get isTimer(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.TIMER;
  }
  get isSnapshot(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.SNAPSHOT;
  }
  get isGuild(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.GUILD;
  }
  get isXiaoYuZhou(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.XIAOYUZHOU;
  }
  get isSoQuest(): boolean {
    return this.form?.get('type')?.value === NotifyObserverTypes.SOQUEST;
  }
  timerMessage = '00:00 到 01:00 为服务维护时间，不建议在此时间段内设置定时任务'

  constructor(private fb: FormBuilder, private service: NotifyObserverService) { }

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
