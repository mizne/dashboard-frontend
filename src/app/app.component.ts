import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SystemNotificationService, ClientNotifyService } from './shared';

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
      this.systemNotificationService.notify(
        data.type,
        `name: ${data.payload.name}, symbol: ${data.payload.symbol}`,
        (event: Event) => {
          event.preventDefault(); // prevent the browser from focusing the Notification's tab
          window.open(
            `https://www.binance.com/zh-CN/trade/${data.payload.symbol}`,
            '_blank'
          );
        }
      );
    });
  }

  private listenTaskCompleteNotify() {
    this.clientNotifyService.listenTaskComplete().subscribe((data) => {
      this.systemNotificationService.notify(data.type, `${data.payload.desc}`);
    });
  }

  private listenTaskErrorNotify() {
    this.clientNotifyService.listenTaskError().subscribe((data) => {
      this.systemNotificationService.notify(data.type, `${data.payload.desc}`);
    });
  }
}
