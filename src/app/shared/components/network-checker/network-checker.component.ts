import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedService } from '../../services';
import { firstValueFrom } from 'rxjs';
import { sleep } from 'src/app/utils';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'network-checker',
  templateUrl: 'network-checker.component.html',
})
export class NetworkCheckerComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private notification: NzNotificationService
  ) {}

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
    // {
    //   hostname: 'www.crunchbase.com',
    //   status: 'loading',
    //   message: 'loading',
    // },
    {
      hostname: 'crypto-fundraising.info',
      status: 'loading',
      message: 'loading',
    },
  ];
  status: 'loading' | 'error' | 'success' | '' = '';

  ngOnInit() {
    if (environment.production) {
      this.intervalCheckConnections();
    }
  }
  private async intervalCheckConnections() {
    for (;;) {
      try {
        this.status = 'loading';

        for (const con of this.connections) {
          con.message = 'loading';
          con.status = 'loading';
        }
        const items = await firstValueFrom(
          this.sharedService.checkConnections()
        );

        this.status = 'success';
        for (const con of this.connections) {
          const the = items.find((e) => e.hostname === con.hostname);
          if (the) {
            con.status = the.status;
            con.message = the.message;
          }
        }
      } catch (e) {
        this.notification.error(`检查链接失败`, `${(e as Error).message}`);
        this.status = 'error';
      }

      await sleep(10 * 60 * 1e3);
    }
  }
}
