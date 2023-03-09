import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Article, SharedService } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-blog',
  templateUrl: './blog.component.html',
})
export class CreateBlogComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});
  @Input() action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private notification: NzNotificationService
  ) { }

  editorOptions1 = { theme: 'vs-dark', tabSize: 2, language: 'json' };
  editorOptions = { theme: 'vs-dark', tabSize: 2, language: 'javascript' };

  ngOnInit(): void {
  }

  blogs: Article[] = [];
  logs: Array<{
    type: 'debug' | 'error';
    content: string;
  }> = [];
  blogTesting = false;
  showBlogsModal = false;

  blogTester() {
    if (!this.data.value.blogURL) {
      this.notification.error(`blogURL required`, `blogURL required`)
      return
    }

    if (!this.data.value.blogScript) {
      this.notification.error(`blogScript required`, `blogScript required`)
      return
    }

    const params = {
      script: this.data.value.blogScript
    }
    this.blogTesting = true;

    this.sharedService.fetchBlogTester(params)
      .subscribe({
        next: (v) => {
          this.showBlogsModal = true;
          this.blogTesting = false;
          this.blogs = v.results;
          this.logs = [];
          for (const e of v.logs.debugs) {
            this.logs.push({
              type: 'debug',
              content: e
            })
          }
          for (const e of v.logs.errors) {
            this.logs.push({
              type: 'error',
              content: e
            })
          }
        },
        error: (err: Error) => {
          this.blogTesting = false;
          this.notification.error(`test blog error`, `${err.message}`)
        }
      })
  }
}
