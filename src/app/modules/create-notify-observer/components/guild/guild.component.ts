import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-guild',
  templateUrl: './guild.component.html',
})
export class CreateGuildComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }
}
