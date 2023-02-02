import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'linkable',
  templateUrl: './linkable.component.html',
  styleUrls: ['./linkable.component.less']
})
export class LinkableComponent implements OnInit {
  private _href?: string;
  @Input()
  set href(v: string | undefined) {
    if (v) {
      this._href = v;
      this.validHref = (v || '').startsWith('http');
    } else {
      this._href = '';
      this.validHref = false;
    }
  }
  get href() {
    return this._href || '';
  }

  @Input() icon = 'link';
  @Input() shape: 'circle' | 'round' = 'circle';
  @Input() size: 'small' | 'default' | 'large' = 'default';

  @Input() title = '';

  @Input() content: TemplateRef<any> | null = null;
  templateContext: { [key: string]: any } = {};

  validHref = false;
  constructor() { }
  ngOnInit() { }
}
