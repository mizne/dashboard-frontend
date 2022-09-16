import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
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
    private readonly systemNotificationService: SystemNotificationService,
    private readonly nzNotificationService: NzNotificationService
  ) {}

  ngOnInit(): void {
    if (!environment.production) {
      document.title = `DEV - ${document.title}`;
    }

    this.listenNewlyCoinNotify();
  }

  private listenNewlyCoinNotify() {
    this.clientNotifyService.listenNewlyCoin().subscribe((data) => {
      console.log(`[AppComponent] listenNotify() data: `, data);

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
}
