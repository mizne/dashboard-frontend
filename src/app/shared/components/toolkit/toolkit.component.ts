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

  types = [
    NotifyObserverTypes.BLOG,
    NotifyObserverTypes.GALXE,
    NotifyObserverTypes.GHOST,
    NotifyObserverTypes.GUILD,
    NotifyObserverTypes.LINK3,
    NotifyObserverTypes.MEDIUM,
    NotifyObserverTypes.MIRROR,
    NotifyObserverTypes.QUEST3,
    NotifyObserverTypes.SNAPSHOT,
    NotifyObserverTypes.SUBSTACK,
    NotifyObserverTypes.TWITTER_SPACE,
    NotifyObserverTypes.TWITTER,
    NotifyObserverTypes.XIAOYUZHOU,
  ]

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
