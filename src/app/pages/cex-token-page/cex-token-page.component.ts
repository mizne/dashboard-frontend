import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenTag, CexTokenTagService, KlineIntervals, tokenTagNameOfTotalMarket } from 'src/app/shared';

@Component({
  selector: 'app-cex-token-page',
  templateUrl: './cex-token-page.component.html',
  styleUrls: ['./cex-token-page.component.less'],
})
export class CexTokenPageComponent implements OnInit {
  constructor(
    private readonly cexTokenTagService: CexTokenTagService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder,
  ) { }

  intervals = [
    {
      label: '4h',
      name: KlineIntervals.FOUR_HOURS,
    },
    {
      label: '1d',
      name: KlineIntervals.ONE_DAY,
    },
  ];
  form = this.fb.group({
    interval: [this.intervals[0].name],
  });

  interval: KlineIntervals = KlineIntervals.FOUR_HOURS

  tags: CexTokenTag[] = [];

  ngOnInit(): void {
    this.fetchTags();

    this.form.valueChanges.subscribe(() => {
      this.interval = this.form.get('interval')?.value as KlineIntervals
    })
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
