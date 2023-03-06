import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-twitter-space',
  templateUrl: './twitter-space.component.html',
})
export class CreateTwitterSpaceComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }
}
