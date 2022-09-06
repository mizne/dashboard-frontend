import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/shared';
import {
  firstValueFrom,
  interval,
  mergeMap,
  pipe,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { format } from 'date-fns';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  isCollapsed = false;

  offsetTop = 80;

  connections: Array<{
    hostname: string;
    status: 'success' | 'error' | 'loading';
    message: string;
  }> = [
    {
      hostname: 'api.stepn.com',
      status: 'loading',
      message: 'loading',
    },
    {
      hostname: 'api.binance.com',
      status: 'loading',
      message: 'loading',
    },
    {
      hostname: 'twitter.com',
      status: 'loading',
      message: 'loading',
    },
    {
      hostname: 'medium.com',
      status: 'loading',
      message: 'loading',
    },
    {
      hostname: 't.me',
      status: 'loading',
      message: 'loading',
    },
    {
      hostname: 'www.youtube.com',
      status: 'loading',
      message: 'loading',
    },
    {
      hostname: 'discord.com',
      status: 'loading',
      message: 'loading',
    },
    {
      hostname: 'www.crunchbase.com',
      status: 'loading',
      message: 'loading',
    },
    {
      hostname: 'crypto-fundraising.info',
      status: 'loading',
      message: 'loading',
    },
  ];
  lastUpdateAtStrPrefix = '更新时间: ';
  lastUpdateAtStr = this.lastUpdateAtStrPrefix + '';

  constructor(
    private sharedService: SharedService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (!environment.production) {
      document.title = `DEV - ${document.title}`;
    }

    this.intervalCheckConnections();
  }

  private async intervalCheckConnections() {
    for (;;) {
      try {
        this.lastUpdateAtStr = this.lastUpdateAtStrPrefix + '正在更新';
        for (const con of this.connections) {
          con.message = 'loading';
          con.status = 'loading';
        }
        const items = await firstValueFrom(
          this.sharedService.checkConnections()
        );

        this.lastUpdateAtStr =
          this.lastUpdateAtStrPrefix + format(new Date(), 'MM-dd HH:mm:ss');
        for (const con of this.connections) {
          const the = items.find((e) => e.hostname === con.hostname);
          if (the) {
            con.status = the.status;
            con.message = the.message;
          }
        }
      } catch (e) {
        this.notification.error(`检查链接失败`, `${(e as Error).message}`);
      }

      await this.sleep(4 * 60 * 1e3);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
