import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable, of, startWith, map } from 'rxjs';
import { TimerService } from '../../services';
import { stringifyMills } from 'src/app/utils';
import { format } from 'date-fns';

@Component({
  selector: 'update-time',
  templateUrl: 'update-time.component.html',
  styles: [
    `
      :host {
      }
    `,
  ],
})
export class UpdateTimeComponent implements OnInit, OnChanges {
  constructor(private readonly timerService: TimerService) {}

  @Input() status: 'loading' | 'success' | 'error' | '' = '';

  lastUpdateAtStr$: Observable<string> = of('--');
  timeAt = '--';

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    const status = changes['status'] && changes['status'].currentValue;
    if (status === 'loading') {
      const fetchingAt = new Date().getTime();
      this.timeAt = format(fetchingAt, 'MM-dd HH:mm:ss');
      this.lastUpdateAtStr$ = this.timerService.interval(1).pipe(
        startWith(0),
        map(
          () =>
            '更新时间：正在更新 ' +
            stringifyMills(new Date().getTime() - fetchingAt)
        )
      );
    } else if (status === 'success' || status === 'error') {
      const updatedAt = new Date().getTime();
      this.timeAt = format(updatedAt, 'MM-dd HH:mm:ss');
      this.lastUpdateAtStr$ = this.timerService.interval(1).pipe(
        startWith(0),
        map(
          () =>
            '更新时间：' +
            stringifyMills(new Date().getTime() - updatedAt) +
            ' ago'
        )
      );
    } else {
      this.timeAt = '--';
      this.lastUpdateAtStr$ = of('--');
    }
  }
}
