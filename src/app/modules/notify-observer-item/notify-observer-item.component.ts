import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverTypeManagerService } from 'src/app/modules/create-notify-observer';

interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'notify-observer-item',
  templateUrl: 'notify-observer-item.component.html'
})

export class NotifyObserverItemComponent implements OnInit {
  constructor(
    private readonly notifyObserverTypeService: NotifyObserverTypeManagerService
  ) { }

  @Input() mode: 'small' | 'default' = 'default'

  @Input() width = 320;
  @Input() item: TableItem | null = null;

  @Output() update = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() search = new EventEmitter<void>();

  ngOnInit() { }

  resolveHref(item: TableItem) {
    return this.notifyObserverTypeService.resolveHref(item)
  }

  resolveDesc(item: TableItem) {
    return this.notifyObserverTypeService.resolveDesc(item)
  }

  confirmUpdate() {
    this.update.emit();
  }

  confirmDelete() {
    this.delete.emit();
  }

  toSearch() {
    this.search.emit();
  }
}