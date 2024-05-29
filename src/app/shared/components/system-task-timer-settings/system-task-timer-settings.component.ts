import { Component, OnInit, Input } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  KlineIntervalService,
  SharedService,
  SystemTaskTimerSettingsService,
  TimerService,
} from '../../services';
import { merge, startWith, map } from 'rxjs';
import { KlineIntervals } from '../../models/base.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotifyObserverTypes } from '../../models';

@Component({
  selector: 'system-task-timer-settings',
  templateUrl: 'system-task-timer-settings.component.html',
})
export class SystemTaskTimerSettingsComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private systemTaskTimerSettingsService: SystemTaskTimerSettingsService,
    private notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  @Input() type = NotifyObserverTypes.BLOG

  visible = false;

  fetchingGlobalSettings = false;
  globalSettingsID = '';

  form: FormGroup<any> = this.fb.group({
    timerMonth: [[]],
    timerDate: [[]],
    timerHour: [[]],
    timerMinute: [[]],
    timerDayOfWeek: [[]],
  });



  ngOnInit() { }

  submitForm(): void {
    if (this.globalSettingsID) {
      this.updateItem();
    } else {
      this.createItem();
    }
  }

  open(): void {
    this.visible = true;
    this.fetchGlobalSettings()
  }

  close(): void {
    this.visible = false;
  }

  private fetchGlobalSettings() {
    this.fetchingGlobalSettings = true;
    this.systemTaskTimerSettingsService.queryList({ type: this.type })
      .subscribe(
        {
          next: (v) => {
            if (v.length === 0) {
              this.notification.info(`还没有 ${this.type} 定时任务`, `还没有 ${this.type} 定时任务`);
              this.fetchingGlobalSettings = false;
            }

            if (v.length === 1) {
              this.notification.success(`获取 ${this.type} 定时任务成功`, `获取 ${this.type} 定时任务成功`);
              this.fetchingGlobalSettings = false;
              this.globalSettingsID = v[0]._id;
              this.form.get('timerMonth')?.patchValue(v[0].timerMonth)
              this.form.get('timerDate')?.patchValue(v[0].timerDate)
              this.form.get('timerHour')?.patchValue(v[0].timerHour)
              this.form.get('timerMinute')?.patchValue(v[0].timerMinute)
              this.form.get('timerDayOfWeek')?.patchValue(v[0].timerDayOfWeek)
            }

            if (v.length >= 2) {
              this.notification.error(` ${this.type} 定时任务有${v.length}个`, `请检查并删除多余的`);
              this.fetchingGlobalSettings = true;
            }
          },
          error: (e: Error) => {
            this.notification.error(`获取 ${this.type} 定时任务失败`, `${e.message}`);
            this.fetchingGlobalSettings = false;
          },
        }
      )
  }

  private createItem() {
    const timerMonth = this.form.get('timerMonth')?.value as number[];
    const timerDate = this.form.get('timerDate')?.value as number[];
    const timerHour = this.form.get('timerHour')?.value as number[];
    const timerMinute = this.form.get('timerMinute')?.value as number[];
    const timerDayOfWeek = this.form.get('timerDayOfWeek')?.value as number[];
    this.systemTaskTimerSettingsService.create({
      type: this.type,
      timerMonth,
      timerDate,
      timerHour,
      timerMinute,
      timerDayOfWeek
    })
      .subscribe({
        next: (v) => {
          if (v.code === 0) {
            this.notification.success(`创建成功`, `${v.message}`);
            this.visible = false;
          } else {
            this.notification.error(`创建失败`, `${v.message}`);
          }
        },
        error: (e: Error) => {
          this.notification.error(`创建失败`, `${e.message}`);
        },
      })
  }

  private updateItem() {
    const timerMonth = this.form.get('timerMonth')?.value as number[];
    const timerDate = this.form.get('timerDate')?.value as number[];
    const timerHour = this.form.get('timerHour')?.value as number[];
    const timerMinute = this.form.get('timerMinute')?.value as number[];
    const timerDayOfWeek = this.form.get('timerDayOfWeek')?.value as number[];

    if (timerHour.length === 0 || timerMinute.length === 0) {
      this.notification.error(`hour minute必填`, `hour minute必填`);
      return
    }

    this.systemTaskTimerSettingsService.update(this.globalSettingsID, {
      timerMonth,
      timerDate,
      timerHour,
      timerMinute,
      timerDayOfWeek
    })
      .subscribe({
        next: (v) => {
          if (v.code === 0) {
            this.notification.success(`修改成功`, `${v.message}`);
            this.visible = false;
          } else {
            this.notification.error(`修改失败`, `${v.message}`);
          }
        },
        error: (e: Error) => {
          this.notification.error(`修改失败`, `${e.message}`);
        },
      })
  }
}
