import { Component, OnInit } from '@angular/core';
import { ClientNotifyService } from '../../services';
import { DestroyService } from '../../services/destroy.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'notify-history-drawer',
  templateUrl: 'notify-history-drawer.component.html',
  providers: [DestroyService],
})
export class NotifyHistoryDrawerComponent implements OnInit {
  constructor(
    private readonly destroy$: DestroyService,
    private readonly clientNotifyService: ClientNotifyService,
  ) { }

  visible = false;
  unReadCount = 0;
  ngOnInit() {
    this.clientNotifyService
      .listenNotifyObserver()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.unReadCount += 1;
      });
  }

  open(): void {
    this.visible = true;
    this.unReadCount = 0;
  }

  close(): void {
    this.visible = false;
  }
}
