import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import {
  AirdropAccount,
} from 'src/app/shared';

interface TableItem extends AirdropAccount {
}

@Component({
  selector: 'airdrop-account-item',
  templateUrl: './airdrop-account-item.component.html',
  styleUrls: ['./airdrop-account-item.component.less'],
})
export class AirdropAccountItemComponent implements OnInit {
  constructor() { }

  @Input() item: TableItem | null = null;
  @Input() showUpdate = true;
  @Input() showDelete = true;
  @Input() showRead = true;

  @Output() read = new EventEmitter<void>()
  @Output() delete = new EventEmitter<void>()
  @Output() update = new EventEmitter<void>()

  manageAttendJobModalVisible = false
  airdropAccountID: any = null

  ngOnInit(): void {
  }

  confirmRead(item: TableItem) {
    this.read.next()
  }

  confirmUpdate(item: TableItem) {
    this.update.emit();
  }

  projectDetailHref(id: string): string {
    return `${location.protocol}//${location.host}/airdrop-account/detail/${id}`;
  }

  confirmDelete(item: TableItem) {
    this.delete.emit()
  }

  showManageAirdropAccount() {
    this.manageAttendJobModalVisible = true;
    this.airdropAccountID = this.item?._id
  }
}
