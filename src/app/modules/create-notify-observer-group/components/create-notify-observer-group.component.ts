import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-notify-observer-group',
  templateUrl: './create-notify-observer-group.component.html',
  styleUrls: ['./create-notify-observer-group.component.less'],
})
export class CreateNotifyObserverGroupComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  constructor(
    private fb: FormBuilder,
  ) { }


  ngOnInit(): void {
  }

}
