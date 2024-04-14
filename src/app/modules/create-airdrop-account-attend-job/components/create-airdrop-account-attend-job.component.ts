import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-create-airdrop-account-attend-job',
  templateUrl: './create-airdrop-account-attend-job.component.html',
  styleUrls: ['./create-airdrop-account-attend-job.component.less'],
})
export class CreateAirdropAccountAttendJobComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }


}
