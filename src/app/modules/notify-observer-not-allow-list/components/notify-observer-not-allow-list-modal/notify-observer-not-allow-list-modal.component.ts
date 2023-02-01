import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notify-observer-not-allow-list-modal',
  templateUrl: './notify-observer-not-allow-list-modal.component.html',
  styleUrls: ['./notify-observer-not-allow-list-modal.component.less'],
})
export class NotifyObserverNotAllowListModalComponent implements OnInit {
  constructor(
  ) { }

  notifyObserverNotAllowModalVisible = false;

  ngOnInit(): void {
  }
}
