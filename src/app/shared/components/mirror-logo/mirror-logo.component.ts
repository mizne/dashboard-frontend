import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mirror-logo',
  templateUrl: 'mirror-logo.component.html',
})
export class MirrorLogoComponent implements OnInit {
  constructor() {}

  @Input() width = 24;

  ngOnInit() {}
}
