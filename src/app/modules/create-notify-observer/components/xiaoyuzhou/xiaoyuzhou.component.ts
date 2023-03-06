import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-xiaoyuzhou',
  templateUrl: './xiaoyuzhou.component.html',
})
export class CreateXiaoYuZhouComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }
}
