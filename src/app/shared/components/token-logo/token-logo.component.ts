import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'token-logo',
  templateUrl: 'token-logo.component.html',
})
export class TokenLogoComponent implements OnInit {
  constructor() {}

  @Input() name = '';

  logoBasePath = environment.imageBaseURL;

  ngOnInit() {}
}
