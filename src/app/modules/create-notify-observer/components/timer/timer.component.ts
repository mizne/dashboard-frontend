import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedService } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-timer',
  templateUrl: './timer.component.html',
})
export class CreateTimerComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});
  @Input() action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private notification: NzNotificationService,
  ) { }

  timerMessage = '00:00 到 01:00 为服务维护时间，不建议在此时间段内设置定时任务'

  editorOptions = { theme: 'vs-dark', tabSize: 2, language: 'typescript' };

  ngOnInit(): void {
  }

  obj: {
    title: string;
    infos: string[];
    link: string;
  } | null = null;
  logs: Array<{
    type: 'debug' | 'error';
    content: string;
  }> = [];
  testing = false;
  showModal = false;

  tester() {
    if (!this.data.value.timerScript) {
      this.notification.error(`timerScript required`, `timerScript required`)
      return
    }

    this.testing = true;

    this.sharedService.fetchTimerTester(this.data.value.timerScript)
      .subscribe({
        next: (v) => {
          this.showModal = true;
          this.testing = false;
          this.obj = v.result;
          this.logs = [];
          for (const e of v.logs.debugs) {
            this.logs.push({
              type: 'debug',
              content: e
            })
          }
          for (const e of v.logs.errors) {
            this.logs.push({
              type: 'error',
              content: e
            })
          }
        },
        error: (err: Error) => {
          this.testing = false;
          this.notification.error(`test error`, `${err.message}`)
        }
      })
  }
}
