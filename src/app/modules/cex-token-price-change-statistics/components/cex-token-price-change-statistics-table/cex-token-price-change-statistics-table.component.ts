import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CexTokenPriceChangeStatistics, CexTokenPriceChangeStatisticsService } from 'src/app/shared';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'cex-token-price-change-statistics-table',
  templateUrl: 'cex-token-price-change-statistics-table.component.html'
})
export class CexTokenPriceChangeStatisticsTableComponent implements OnInit, OnChanges {
  constructor(
    private readonly cexTokenPriceChangeStatisticsService: CexTokenPriceChangeStatisticsService,
    private readonly notification: NzNotificationService,
    private fb: FormBuilder
  ) { }

  @Input() inDays: null | undefined | number = 180;

  @Output() selectTime = new EventEmitter<number>()

  total = 0;
  items: CexTokenPriceChangeStatistics[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    time: -1,
  };


  ngOnInit(): void {
    this.loadDataFromServer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pageIndex = 1;
    this.loadDataFromServer();
  }

  select(item: CexTokenPriceChangeStatistics) {
    this.selectTime.emit(item.time)
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sort = this.buildSort(sortField, sortOrder);
    this.loadDataFromServer();
  }

  private loadDataFromServer(): void {
    this.loading = true;
    this.query = {
      inDays: this.inDays || 180
    };
    const adjustedQuery = this.adjustQuery(this.query)
    this.cexTokenPriceChangeStatisticsService
      .queryList(
        adjustedQuery,
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe(
        (results) => {
          this.loading = false;
          this.items = results;
        },
        (e: Error) => {
          this.loading = false;
          this.notification.error(`获取失败`, `${e.message}`);
        }
      );

    this.cexTokenPriceChangeStatisticsService
      .queryCount(adjustedQuery)
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // MARK: 
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {

      Object.assign(o, { [key]: query[key] });
    });
    return o;
  }

  private buildSort(sortField?: string | null, sortOrder?: string | null) {
    if (!sortField) {
      return {
        createdAt: -1,
      };
    }

    if (sortField === 'timeStr' || sortField === 'createdAtStr') {
      if (sortOrder === 'ascend') {
        return {
          [sortField.slice(0, -3)]: 1,
        };
      }
      if (sortOrder === 'descend') {
        return {
          [sortField.slice(0, -3)]: -1,
        };
      }
    }

    return sortOrder === 'ascend'
      ? { [sortField]: 1 }
      : sortOrder === 'descend'
        ? { [sortField]: -1 }
        : {
          createdAt: -1,
        };
  }
}