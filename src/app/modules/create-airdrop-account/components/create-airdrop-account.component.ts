import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AirdropAccountService } from 'src/app/shared';

@Component({
  selector: 'app-create-airdrop-account',
  templateUrl: './create-airdrop-account.component.html',
  styleUrls: ['./create-airdrop-account.component.less'],
})
export class CreateAirdropAccountComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private airdropAccountService: AirdropAccountService
  ) { }

  ngOnInit(): void {
  }


}
