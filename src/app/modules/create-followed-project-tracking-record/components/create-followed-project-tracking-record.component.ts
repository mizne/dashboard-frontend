import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TagTypes } from 'src/app/shared';

@Component({
  selector: 'app-create-followed-project-tracking-record',
  templateUrl: './create-followed-project-tracking-record.component.html',
  styleUrls: ['./create-followed-project-tracking-record.component.less'],
})
export class CreateFollowedProjectTrackingRecordComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  tagType = TagTypes.TRACKING_RECORD_CATEGORY;

  constructor(
    private fb: FormBuilder,
  ) { }


  ngOnInit(): void {
  }

}
