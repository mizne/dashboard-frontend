import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'image-view',
  templateUrl: 'image-view.component.html',
})
export class ImageViewComponent implements OnInit {
  constructor() { }

  private _name: string | null | undefined = ''

  @Input()
  set name(v: string | null | undefined) {
    if (v && v.startsWith('/logos')) {
      this.logoBasePath = environment.baseURL;
    }
    this._name = v;
  };
  get name() {
    return this._name
  }

  @Input() width = 32;

  logoBasePath = environment.imageBaseURL;

  ngOnInit() { }
}
