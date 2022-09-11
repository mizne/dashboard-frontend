import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedService } from '../../services';
import { firstValueFrom, map, Observable, of, startWith } from 'rxjs';
import { format } from 'date-fns';
import { sleep, stringifyMills } from 'src/app/utils';

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
  lastUpdateAtStr$: Observable<string> = of('');

  ngOnInit() {
    this.intervalCheckConnections();
  }
  private async intervalCheckConnections() {
    for (;;) {
      try {
        this.lastUpdateAtStr$ = of('更新时间：正在更新');
        for (const con of this.connections) {
          con.message = 'loading';
          con.status = 'loading';
        }
        const items = await firstValueFrom(
          this.sharedService.checkConnections()
        );

        const updatedAt = new Date().getTime();
        this.lastUpdateAtStr$ = this.sharedService.interval(1).pipe(
          startWith(0),
          map(
            () =>
              '更新时间：' + stringifyMills(new Date().getTime() - updatedAt)
          )
        );
        for (const con of this.connections) {
          const the = items.find((e) => e.hostname === con.hostname);
          if (the) {
            con.status = the.status;
            con.message = the.message;
          }
        }
      } catch (e) {
        this.notification.error(`检查链接失败`, `${(e as Error).message}`);
        const updatedAt = new Date().getTime();
        this.lastUpdateAtStr$ = this.sharedService.interval(1).pipe(
          startWith(0),
          map(
            () =>
              '更新时间：' + stringifyMills(new Date().getTime() - updatedAt)
          )
        );
      }

      await sleep(10 * 60 * 1e3);
    }
  }
}
