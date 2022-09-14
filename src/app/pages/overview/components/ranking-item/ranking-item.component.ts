import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ranking-item',
  templateUrl: 'ranking-item.component.html',
})
export class RankingItemComponent implements OnInit {
  constructor() {}

  @Input() index: number = -1;
  @Input() symbol = '';
  @Input() percent = 0;
  @Input() prevPercent = 0;
  @Input() color: string | undefined = '';
  @Input() text: string | undefined = '';

  ngOnInit() {}
}
