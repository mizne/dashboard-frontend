import { Component, OnInit } from '@angular/core';
import { ClientNotifyService } from '../../services';

@Component({
  selector: 'toolkit',
  templateUrl: 'toolkit.component.html',
})
export class ToolkitComponent implements OnInit {
  constructor(
    private clientNotifyService: ClientNotifyService
  ) { }

  visible = false;

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
