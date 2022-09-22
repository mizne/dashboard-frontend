import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'toolkit',
  templateUrl: 'toolkit.component.html',
})
export class ToolkitComponent implements OnInit {
  constructor() {}

  visible = false;

  ngOnInit() {}

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }
}
