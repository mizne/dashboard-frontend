import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenTag, CexTokenTagService, tokenTagNameOfTotalMarket } from 'src/app/shared';

@Component({
  selector: 'app-cex-token-page',
  templateUrl: './cex-token-page.component.html',
  styleUrls: ['./cex-token-page.component.less'],
})
export class CexTokenPageComponent implements OnInit {
  constructor(
    private readonly cexTokenTagService: CexTokenTagService,
    private readonly notification: NzNotificationService,
  ) { }

  tags: CexTokenTag[] = []

  ngOnInit(): void {
    this.fetchTags();
  }

  private fetchTags() {
    this.cexTokenTagService.queryList({})
      .subscribe({
        next: (tags) => {
          this.tags = [
            ...tags.filter(e => e.name === tokenTagNameOfTotalMarket),
            ...tags.filter(e => e.name !== tokenTagNameOfTotalMarket),
          ]
        },
        error: (err: Error) => {
          this.notification.error(`获取CexTokenTag失败`, `获取CexTokenTag失败`)
        }
      })
  }
}
