import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'quest3-logo',
  templateUrl: 'quest3-logo.component.html',
})
export class Quest3LogoComponent implements OnInit {
  constructor() { }

  @Input() width = 36;

  ngOnInit() { }
}
