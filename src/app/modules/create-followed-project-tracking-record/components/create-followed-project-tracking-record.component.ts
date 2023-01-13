import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-followed-project-tracking-record',
  templateUrl: './create-followed-project-tracking-record.component.html',
  styleUrls: ['./create-followed-project-tracking-record.component.less'],
})
export class CreateFollowedProjectTrackingRecordComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  constructor(
    private fb: FormBuilder,
  ) { }


  ngOnInit(): void {
  }

}
