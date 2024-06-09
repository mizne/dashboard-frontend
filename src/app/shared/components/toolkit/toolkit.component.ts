import { Component, OnInit } from '@angular/core';
import { ClientNotifyService, SharedService } from '../../services';
import { NotifyObserverTypes } from '../../models';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'toolkit',
  templateUrl: 'toolkit.component.html',
})
export class ToolkitComponent implements OnInit {
  constructor(
    private clientNotifyService: ClientNotifyService,
    private sharedService: SharedService,
    private nzNotificationService: NzNotificationService,
    private message: NzMessageService
  ) { }

  visible = false;

  types = [
    NotifyObserverTypes.GALXE,
    NotifyObserverTypes.GALXE_RECOMMEND,
    NotifyObserverTypes.QUEST3,
    NotifyObserverTypes.QUEST3_RECOMMEND,
    NotifyObserverTypes.BLOG,
    NotifyObserverTypes.GHOST,
    NotifyObserverTypes.GUILD,
    NotifyObserverTypes.LINK3,
    NotifyObserverTypes.MEDIUM,
    NotifyObserverTypes.MIRROR,
    NotifyObserverTypes.SNAPSHOT,
    NotifyObserverTypes.SUBSTACK,
    NotifyObserverTypes.TWITTER_SPACE,
    NotifyObserverTypes.TWITTER,
    NotifyObserverTypes.XIAOYUZHOU,
  ]

  relinkPM2loading = false

  ngOnInit() { }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  markMainClient() {
    this.clientNotifyService.markIdentity()
  }

  relinkPM2() {
    this.relinkPM2loading = true
    const ref = this.message.loading(`执行脚本中...`, { nzDuration: 0 })
    this.sharedService.relinkPM2()
      .subscribe({
        next: (res) => {
          this.relinkPM2loading = false
          this.message.remove(ref.messageId)
          if (res.code === 0) {
            this.nzNotificationService.success(`Relink PM2 成功`, `${res.result}`)
          } else {
            this.nzNotificationService.error(`Relink PM2 失败`, `${res.message}`)
          }
        },
        error: (err) => {
          this.relinkPM2loading = false
          this.message.remove(ref.messageId)
          this.nzNotificationService.error(`Relink PM2 失败`, `${err.message}`)
        }
      })
  }
}
