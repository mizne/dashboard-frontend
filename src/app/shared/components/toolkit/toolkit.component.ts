import { Component, OnInit } from '@angular/core';
import { ClientNotifyService } from '../../services';
import { NotifyObserverTypes } from '../../models';

@Component({
  selector: 'toolkit',
  templateUrl: 'toolkit.component.html',
})
export class ToolkitComponent implements OnInit {
  constructor(
    private clientNotifyService: ClientNotifyService
  ) { }

  visible = false;

  types = [NotifyObserverTypes.BLOG, NotifyObserverTypes.GALXE]

  ngOnInit() { }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  markMainClient() {
    this.clientNotifyService.markIdentity()
  }
}
