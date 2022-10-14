import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'medium-logo',
  templateUrl: 'medium-logo.component.html',
})
export class MediumLogoComponent implements OnInit {
  constructor() {}

  @Input() width = 32;

  ngOnInit() {}
}
