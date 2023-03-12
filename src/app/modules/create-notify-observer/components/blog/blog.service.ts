import { Injectable, Type } from '@angular/core';
import { NotifyObserver, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../../notify-observer-type-manager.service';
import { NotifyObserverTypeServiceInterface } from '../../notify-observer-type-service.interface';
import { FormItemInterface } from '../form-item.interface';
import { CreateBlogComponent } from './blog.component';

@Injectable()
export class BlogService implements NotifyObserverTypeServiceInterface {
  constructor(private manageService: NotifyObserverTypeManagerService) {
    manageService.registerTypeService(this)
  }
  type: NotifyObserverTypes = NotifyObserverTypes.BLOG;

  resolveComponent(): Type<FormItemInterface> {
    return CreateBlogComponent
  }

  checkValidForm(obj: Partial<NotifyObserver>): { code: number; message?: string | undefined; } {
    if (!obj.blogURL) {
      return { code: -1, message: `没有填写blogURL` }
    }
    if (!obj.blogScript) {
      return { code: -1, message: `没有填写blogScript` }
    }
    return { code: 0 }
  }

  resolveExistedCondition(obj: Partial<NotifyObserver>): Partial<NotifyObserver> | null {
    return obj.blogURL ? { type: NotifyObserverTypes.BLOG, blogURL: obj.blogURL } : null
  }

  resolveHref(item: NotifyObserver): string {
    return item.blogURL || ''
  }

  resolveDesc(item: NotifyObserver): string {
    return item.blogURL || ''
  }

  resolvePartialFormGroup(obj: Partial<NotifyObserver>, action: NotifyObserverModalActions) {
    const defaultScriptText = `
    declare var require: any;
    declare var module: any;
    
    const cheerio = require('cheerio');
    const logger = require('logger');
    const axios = require('axios');

    module.exports = async function parseData() {
      const resp = await axios({
        url: 'https://vitalik.ca',
        method: 'get',
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
        }
      });
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
    return {
      blogURL: [obj.blogURL],
      blogScript: [action === NotifyObserverModalActions.CREATE ? defaultScriptText : obj.blogScript],
    }
  }
}