import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Article, SharedService } from 'src/app/shared';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-blog',
  templateUrl: './blog.component.html',
})
export class CreateBlogComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private notification: NzNotificationService
  ) { }

  editorOptions1 = { theme: 'vs-dark', tabSize: 2, language: 'json' };
  editorOptions = { theme: 'vs-dark', tabSize: 2, language: 'javascript' };

  ngOnInit(): void {

    this.data.patchValue({
      blogRequestHeaders: JSON.stringify({
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"
      }, null, 2),
      blogScript: `
      const cheerio = require('cheerio');
      const logger = require('logger');

      module.exports = function parseData(resp) {
        const $ = cheerio.load(resp.data);
        const main = $('.main');
        const items = $('.item', main);
        const articles = []
        for (const e of items) {
          const title = $('.title', e).text();
          const dateTimeStr = $('.date', e).text();
          const urlText = $('.url', e).attr('href');
          const url = 'https://vitalik.ca' + urlText;
          const source = 'Vitalik - Blog';
          articles.push({ title, publishedAt: new Date(dateTimeStr).getTime(), source, url })
        }

        return articles
      }`
    })
  }

  blogs: Article[] = [];
  logs: Array<{
    type: 'debug' | 'error';
    content: string;
  }> = [];
  blogTesting = false;
  showBlogsModal = false;

  blogTester() {
    if (!this.data.value.blogRequestURL) {
      this.notification.error(`blogRequestURL required`, `blogRequestURL required`)
      return
    }

    if (!this.data.value.blogRequestMethod) {
      this.notification.error(`blogRequestMethod required`, `blogRequestMethod required`)
      return
    }

    if (!this.data.value.blogScript) {
      this.notification.error(`blogScript required`, `blogScript required`)
      return
    }

    const params = {
      url: this.data.value.blogRequestURL,
      method: this.data.value.blogRequestMethod,
      headers: this.data.value.blogRequestHeaders ? JSON.parse(this.data.value.blogRequestHeaders) : {},
      script: this.data.value.blogScript
    }
    this.blogTesting = true;

    this.sharedService.fetchBlogTester(params)
      .subscribe({
        next: (v) => {
          this.showBlogsModal = true;
          this.blogTesting = false;
          this.blogs = v.results.slice(0, 5);
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
