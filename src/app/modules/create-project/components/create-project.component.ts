import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CreateProjectService } from '../create-project.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.less'],
})
export class CreateProjectComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});
  @Input() needFetchSocialLinks = false;

  constructor(
    private modal: NzModalRef,
    private fb: FormBuilder,
    private createProjectService: CreateProjectService
  ) {}

  fetchingSocialLinks = false;

  ngOnInit(): void {
    this.form?.valueChanges.subscribe((value) => {
      console.log(`form value: `, value);
    });

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
    this.createProjectService
      .fetchSocialLinkByWebsite(this.form.value.website)
      .subscribe({
        next: (links) => {
          this.fetchingSocialLinks = false;
          console.log(`patchForm() links: `, links);
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
