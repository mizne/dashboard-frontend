import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable, of, startWith, map } from 'rxjs';
import { SharedService } from '../../services';
import { stringifyMills } from 'src/app/utils';

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
  constructor(private readonly sharedService: SharedService) {}

  @Input() status: 'loading' | 'success' | 'error' | '' = '';

  lastUpdateAtStr$: Observable<string> = of('');

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    const status = changes['status'] && changes['status'].currentValue;
    if (status === 'loading') {
      const fetchingAt = new Date().getTime();
      this.lastUpdateAtStr$ = this.sharedService.interval(1).pipe(
        startWith(0),
        map(
          () =>
            '更新时间：正在更新 ' +
            stringifyMills(new Date().getTime() - fetchingAt)
        )
      );
    } else if (status === 'success' || status === 'error') {
      const updatedAt = new Date().getTime();
      this.lastUpdateAtStr$ = this.sharedService.interval(1).pipe(
        startWith(0),
        map(
          () =>
            '更新时间：' +
            stringifyMills(new Date().getTime() - updatedAt) +
            ' ago'
        )
      );
    } else {
      this.lastUpdateAtStr$ = of('');
    }
  }
}
