import { Component, OnInit } from '@angular/core';
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
    private readonly systemNotificationService: SystemNotificationService
  ) {}

  ngOnInit(): void {
    if (!environment.production) {
      document.title = `DEV - ${document.title}`;
    }

    this.listenNewlyCoinNotify();
    this.listenTaskCompleteNotify();
    this.listenTaskErrorNotify();
  }

  private listenNewlyCoinNotify() {
    this.clientNotifyService.listenNewlyCoin().subscribe((data) => {
      this.systemNotificationService.info({
        title: data.type,
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
}
