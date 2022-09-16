import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SystemNotificationService, WebsocketService } from './shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  isCollapsed = false;

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly systemNotificationService: SystemNotificationService
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (!environment.production) {
      document.title = `DEV - ${document.title}`;
    }

    this.listenNewlyCoinNotify();
  }

  private listenNewlyCoinNotify() {
    this.websocketService.listenNewlyCoin().subscribe((data) => {
      console.log(`[AppComponent] listenNotify() data: `, data);

      const notification = this.systemNotificationService.notify(
        data.type,
        `name: ${data.payload.name}, symbol: ${data.payload.symbol}`
      );

      notification.addEventListener('click', (event) => {
        event.preventDefault(); // prevent the browser from focusing the Notification's tab
        window.open(
          `https://www.binance.com/zh-CN/trade/${data.payload.symbol}`,
          '_blank'
        );
      });
    });
  }
}
