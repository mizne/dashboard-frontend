import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

/**
 * @note:
 * Observable abstraction over ngOnDestroy to use with takeUntil
 *
 * Why we use `ReplaySubject` instead of `Subject`?
 * Well, we’ll use ReplaySubject to emit the last message in case
 * the subscription is ended after the component is destroyed.
 */

// copy from https://github.com/Tinkoff/taiga-ui/blob/main/projects/cdk/services/destroy.service.ts
// 每个需要取消订阅Observable的 Component、Directive里provide
@Injectable()
export class DestroyService extends ReplaySubject<void> implements OnDestroy {
  constructor() {
    super(1);
  }

  ngOnDestroy(): void {
    this.next();
    this.complete();
  }
}
