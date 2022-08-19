import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-porject-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.less'],
})
export class ProjectDetailComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    console.log(`id: ${this.route.snapshot.params['id']}`);
  }
}
