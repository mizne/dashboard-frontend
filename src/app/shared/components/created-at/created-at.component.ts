import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'created-at',
  templateUrl: 'created-at.component.html',
})
export class CreatedAtComponent implements OnInit {
  constructor() {}

  @Input() createdAt: number | Date = 0;

  ngOnInit() {}
}
