import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TagTypes } from 'src/app/shared';

@Component({
  selector: 'app-create-airdrop-interaction-record',
  templateUrl: './create-airdrop-interaction-record.component.html',
  styleUrls: ['./create-airdrop-interaction-record.component.less'],
})
export class CreateAirdropInteractionRecordComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  tagType = TagTypes.AIRDROP_INTERACTION_RECORD_CATEGORY;

  constructor(
    private fb: FormBuilder,
  ) { }


  ngOnInit(): void {
  }

}
