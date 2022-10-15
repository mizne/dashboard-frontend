import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'twitter-logo',
  templateUrl: 'twitter-logo.component.html',
})
export class TwitterLogoComponent implements OnInit {
  constructor() {}

  @Input() width = 24;
  @Input() color = 'rgb(29, 155, 240)';

  ngOnInit() {}
}
