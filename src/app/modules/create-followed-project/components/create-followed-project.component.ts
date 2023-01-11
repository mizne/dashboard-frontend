import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CreateFollowedProjectService } from '../create-followed-project.service';

@Component({
  selector: 'app-create-followed-project',
  templateUrl: './create-followed-project.component.html',
  styleUrls: ['./create-followed-project.component.less'],
})
export class CreateFollowedProjectComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});
  @Input() needFetchSocialLinks = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private createFollowedProjectService: CreateFollowedProjectService
  ) { }

  fetchingSocialLinks = false;

  ngOnInit(): void {
    this.patchForm();
  }

  toSearch() {
    if (this.form.value.website) {
      this.fetchSocialLinks();
    }
  }
  private patchForm() {
    if (this.needFetchSocialLinks && this.form.value.website) {
      this.fetchSocialLinks();
    }
  }

  private fetchSocialLinks() {
    this.fetchingSocialLinks = true;
    this.createFollowedProjectService
      .fetchSocialLinkByWebsite(this.form.value.website)
      .subscribe({
        next: (links) => {
          this.fetchingSocialLinks = false;
          if (links.twitter) {
            this.form.patchValue({ twitterHomeLink: links.twitter });
          }
          if (links.telegram) {
            this.form.patchValue({ telegramHomeLink: links.telegram });
          }
          if (links.discord) {
            this.form.patchValue({ discordHomeLink: links.discord });
          }
          if (links.medium) {
            this.form.patchValue({ mediumHomeLink: links.medium });
          }
          if (links.youtube) {
            this.form.patchValue({ youtubeHomeLink: links.youtube });
          }
        },
        error: (e) => {
          this.fetchingSocialLinks = false;
        },
      });
  }
}
