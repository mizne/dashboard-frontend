import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-investor-list-modal',
  templateUrl: './investor-list-modal.component.html',
  styleUrls: ['./investor-list-modal.component.less'],
})
export class InvestorListModalComponent implements OnInit {
  constructor(
  ) { }

  investorModalVisible = false;

  ngOnInit(): void {
  }
}
