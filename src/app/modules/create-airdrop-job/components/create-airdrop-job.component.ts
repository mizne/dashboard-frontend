import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AirdropJobStatus } from 'src/app/shared';

@Component({
  selector: 'app-create-airdrop-job',
  templateUrl: './create-airdrop-job.component.html',
  styleUrls: ['./create-airdrop-job.component.less'],
})
export class CreateAirdropJobComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  statuses = [
    {
      label: '未开始',
      value: AirdropJobStatus.NOT_STARTED
    },
    {
      label: '进行中',
      value: AirdropJobStatus.IN_PROGRESS
    },
    {
      label: '已结束',
      value: AirdropJobStatus.HAS_ENDED
    }
  ]

  constructor(
    private fb: FormBuilder,
  ) { }


  ngOnInit(): void {
  }

}
