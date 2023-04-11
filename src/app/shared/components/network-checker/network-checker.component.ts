import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClientNotifyService, SharedService } from '../../services';
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
    private notification: NzNotificationService,
    private readonly clientNotifyService: ClientNotifyService,
  ) { }

  tasks: Array<{
    id: string;
    name: string;
    priority: number;
    startAt: number;
  }> = [];

  ngOnInit() {
    this.clientNotifyService.listenRunningTasks().subscribe((data) => {
      this.tasks = data.payload.tasks;
    });
  }
}
