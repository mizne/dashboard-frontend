import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'token-actions',
  templateUrl: 'token-actions.component.html',
})
export class TokenActionsComponent implements OnInit {
  constructor() {}

  @Input() symbol = '';
  @Input() slug = '';

  ngOnInit() {}

  resolveMoreHref(symbol: string): string {
    return `${location.protocol}//${
      location.host
    }/overview?symbol=${encodeURIComponent(symbol)}&latestIntervals=0`;
  }
}
