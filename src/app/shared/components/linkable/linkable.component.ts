import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'linkable',
  templateUrl: './linkable.component.html',
})
export class LinkableComponent implements OnInit {
  private _href?: string;
  @Input()
  set href(v: string) {
    this._href = v;
    this.validHref = (v || '').startsWith('http');
  }
  get href() {
    return this._href || '';
  }

  @Input() icon = 'link';
  @Input() shape: 'circle' | 'round' = 'circle';
  @Input() size: 'small' | 'default' | 'large' = 'default';

  @Input() title = '';

  validHref = false;
  constructor() {}
  ngOnInit() {}
}
