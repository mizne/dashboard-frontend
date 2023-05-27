import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedService } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { FormItemInterface } from '../form-item.interface';

@Component({
  selector: 'app-create-timer',
  templateUrl: './timer.component.html',
})
export class CreateTimerComponent implements OnInit, FormItemInterface {
  @Input() data: FormGroup = this.fb.group({});
  @Input() action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private notification: NzNotificationService,
  ) { }

  timerMessage = '00:00 到 01:00 为服务维护时间，不建议在此时间段内设置定时任务'

  editorOptions = { theme: 'vs-dark', tabSize: 2, language: 'typescript' };

  ngOnInit(): void {
  }

  obj: {
    title: string;
    infos: string[];
    link: string;
  } | null = null;
  logs: Array<{
    type: 'debug' | 'error';
    content: string;
  }> = [];
  testing = false;
  showModal = false;

  scriptTemplate =
    `declare var require: any;
declare var module: any;
  
const cheerio = require('cheerio');
const logger = require('logger');
const http = require('http');

module.exports = async function parseData() {
  const resp = await http({
    url: 'https://vitalik.ca',
    method: 'get',
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
    }
  });
  const $ = cheerio.load(resp.data);
  return {
    title: 'DefiLlama',
    infos: [
      
    ],
    link: 'https://defillama.com/',
    predicate: {
      link: 'https://defillama.com/'
    }
  }
}
  `

  scriptTemplateGitbook =
    `declare var require: any;
declare var module: any;
  
const cheerio = require('cheerio');
const logger = require('logger');
const fetchGitbookPages = require('fetchGitbookPages');
const reportProgress = require('reportProgress');

module.exports = async function parseData() {
  const pages = await fetchGitbookPages('https://docs.alpacafinance.org/', 'https://docs.alpacafinance.org/past-products/stronk-vault', reportProgress)

  const pageFilter = (page) => {
    return page.lastUpdatedAt >= new Date().getTime() - 1 * 24 * 60 * 60 * 1e3
  }

  return pages.filter(pageFilter).map(e => {
    const infos = [
      '页面: ' + e.url,
      '更新时间：' + new Date(e.lastUpdatedAt).toLocaleString()
    ]
    return {
      title: 'Alpaca Docs Update | ' + e.url,
      infos: infos,
      link: e.url,
      predicate: {
        desc: infos.join('<br />'),
        link: e.url
      }
    }
  })
}
  `

  scriptTemplateWithEnableStatistics =
    `declare var require: any;
declare var module: any;

const cheerio = require('cheerio');
const logger = require('logger');
const http = require('http');

module.exports = async function parseData() {
const resp = await http({
  url: 'https://vitalik.ca',
  method: 'get',
  headers: {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
  }
});
const $ = cheerio.load(resp.data);
return {
  statistics: {},
  notify: {
    title: 'DefiLlama',
    infos: [
      
    ],
    link: 'https://defillama.com/',
    predicate: {
      link: 'https://defillama.com/'
    }
  }
}
}
`

  copyScriptTemplateSucces(ev: any) {
    this.notification.success(`复制脚本模板成功`, `复制脚本模板成功`)
  }

  copyScriptTemplateError(ev: any) {
    this.notification.error(`复制脚本模板失败`, `复制脚本模板失败`)
  }

  tester() {
    if (!this.data.value.timerScript) {
      this.notification.error(`timerScript required`, `timerScript required`)
      return
    }

    this.testing = true;

    this.sharedService.fetchTimerTester(this.data.value.timerScript)
      .subscribe({
        next: (v) => {
          this.showModal = true;
          this.testing = false;
          this.obj = v.result;
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
          this.testing = false;
          this.notification.error(`test error`, `${err.message}`)
        }
      })
  }
}
