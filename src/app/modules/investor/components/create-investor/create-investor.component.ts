import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-investor',
  templateUrl: './create-investor.component.html',
  styleUrls: ['./create-investor.component.less'],
})
export class CreateInvestorComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }
}
