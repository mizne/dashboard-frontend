import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import {
  FollowedProject,
} from 'src/app/shared';

interface TableItem extends FollowedProject {
  tagIDsCtrl: FormControl;
}

@Component({
  selector: 'followed-project-item',
  templateUrl: './followed-project-item.component.html',
  styleUrls: ['./followed-project-item.component.less'],
})
export class FollowedProjectItemComponent implements OnInit {
  constructor() { }

  @Input() item: TableItem | null = null

  @Output() read = new EventEmitter<void>()
  @Output() delete = new EventEmitter<void>()
  @Output() update = new EventEmitter<void>()

  ngOnInit(): void {
  }

  confirmRead(item: TableItem) {
    this.read.next()
  }

  confirmUpdate(item: TableItem) {
    this.update.emit();
  }

  projectDetailHref(id: string): string {
    return `${location.protocol}//${location.host}/followed-project/detail/${id}`;
  }

  confirmDelete(item: TableItem) {
    this.delete.emit()
  }
}
