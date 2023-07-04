import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  GlobalSettingsService,
  KlineIntervalService,
  SharedService,
  TimerService,
} from '../../services';
import { merge, startWith, map } from 'rxjs';
import { KlineIntervals } from '../../models/base.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'global-settings',
  templateUrl: 'global-settings.component.html',
})
export class GlobalSettingsComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private globalSettingsService: GlobalSettingsService,
    private notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  visible = false;

  fetchingGlobalSettings = false;
  globalSettingsID = '';

  form: FormGroup<any> = this.fb.group({
    defaultKeyOfTwitterNotifyObserver: [null],
    defaultTwitterAuthorization: [null],
    defaultTwitterXCsrfToken: [null],
    defaultTwitterCookie: [null],
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
    this.globalSettingsService.queryList({})
      .subscribe(
        {
          next: (v) => {
            if (v.length === 0) {
              this.notification.info(`还没有全局设置`, `还没有全局设置`);
              this.fetchingGlobalSettings = false;
            }

            if (v.length === 1) {
              this.notification.success(`获取全局设置成功`, `获取全局设置成功`);
              this.fetchingGlobalSettings = false;
              this.globalSettingsID = v[0]._id;
              this.form.get('defaultKeyOfTwitterNotifyObserver')?.patchValue(v[0].defaultKeyOfTwitterNotifyObserver)
              this.form.get('defaultTwitterAuthorization')?.patchValue(v[0].defaultTwitterAuthorization)
              this.form.get('defaultTwitterXCsrfToken')?.patchValue(v[0].defaultTwitterXCsrfToken)
              this.form.get('defaultTwitterCookie')?.patchValue(v[0].defaultTwitterCookie)
            }

            if (v.length >= 2) {
              this.notification.error(`全局设置有${v.length}个`, `请检查并删除多余的`);
              this.fetchingGlobalSettings = true;
            }
          },
          error: (e: Error) => {
            this.notification.error(`获取全局设置失败`, `${e.message}`);
            this.fetchingGlobalSettings = false;
          },
        }
      )
  }

  private createItem() {
    const defaultKeyOfTwitterNotifyObserver = this.form.get('defaultKeyOfTwitterNotifyObserver')?.value as string;
    const defaultTwitterAuthorization = this.form.get('defaultTwitterAuthorization')?.value as string;
    const defaultTwitterXCsrfToken = this.form.get('defaultTwitterXCsrfToken')?.value as string;
    const defaultTwitterCookie = this.form.get('defaultTwitterCookie')?.value as string;
    this.globalSettingsService.create({
      defaultKeyOfTwitterNotifyObserver,
      defaultTwitterAuthorization,
      defaultTwitterXCsrfToken,
      defaultTwitterCookie,
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
    const defaultKeyOfTwitterNotifyObserver = this.form.get('defaultKeyOfTwitterNotifyObserver')?.value as string;
    const defaultTwitterAuthorization = this.form.get('defaultTwitterAuthorization')?.value as string;
    const defaultTwitterXCsrfToken = this.form.get('defaultTwitterXCsrfToken')?.value as string;
    const defaultTwitterCookie = this.form.get('defaultTwitterCookie')?.value as string;
    this.globalSettingsService.update(this.globalSettingsID, {
      defaultKeyOfTwitterNotifyObserver,
      defaultTwitterAuthorization,
      defaultTwitterXCsrfToken,
      defaultTwitterCookie,
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
