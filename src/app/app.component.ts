import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SystemNotificationService, ClientNotifyService } from './shared';
import { sleep } from './utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  isCollapsed = false;

  constructor(
    private readonly clientNotifyService: ClientNotifyService,
    private readonly systemNotificationService: SystemNotificationService,
    @Inject(DOCUMENT) private documentRef: Document
  ) {}

  ngOnInit(): void {
    if (!environment.production) {
      this.documentRef.title = `DEV - ${this.documentRef.title}`;
    }

    this.listenNewlyCoinNotify();
    this.listenTaskCompleteNotify();
    this.listenTaskErrorNotify();
    this.listenNotifyObserver();
  }

  private listenNewlyCoinNotify() {
    this.clientNotifyService.listenNewlyCoin().subscribe((data) => {
      this.systemNotificationService.info({
        title: '新币通知',
        desc: `name: ${data.payload.name}, symbol: ${data.payload.symbol}`,
        click: (event: Event) => {
          event.preventDefault(); // prevent the browser from focusing the Notification's tab
          window.open(
            `https://www.binance.com/zh-CN/trade/${data.payload.symbol}`,
            '_blank'
          );
        },
      });
    });
  }

  private listenTaskCompleteNotify() {
    this.clientNotifyService.listenTaskComplete().subscribe((data) => {
      this.systemNotificationService.success({
        title: data.type,
        desc: `${data.payload.desc}`,
      });
    });
  }

  private listenTaskErrorNotify() {
    this.clientNotifyService.listenTaskError().subscribe((data) => {
      this.systemNotificationService.error({
        title: data.type,
        desc: `${data.payload.desc}`,
      });
    });
  }

  private listenNotifyObserver() {
    this.clientNotifyService.listenNotifyObserver().subscribe((data) => {
      this.systemNotificationService.info({
        title: data.payload.title,
        desc: `${data.payload.desc}`,
        click: (event: Event) => {
          event.preventDefault();
          window.open(`${data.payload.link}`, '_blank');
        },
      });
    });
  }
}
