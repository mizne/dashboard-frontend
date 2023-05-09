import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormBuilder } from '@angular/forms';
import { removeEmpty } from 'src/app/utils';
import { Investor, InvestorService } from 'src/app/shared';
import { CreateInvestorService, InvestorModalActions } from '../../create-investor.service';

@Component({
  selector: 'app-investor-list',
  templateUrl: './investor-list.component.html',
  styleUrls: ['./investor-list.component.less'],
})
export class InvestorListComponent implements OnInit {
  constructor(
    private readonly investorService: InvestorService,
    private readonly nzNotificationService: NzNotificationService,
    private readonly fb: FormBuilder,
    private createInvestorService: CreateInvestorService
  ) { }

  total = 0;
  items: Investor[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  form = this.fb.group({
    name: [null],
  });


  submitForm(): void {
    this.query = removeEmpty(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset({
    });
    this.query = removeEmpty(this.form.value);
    this.pageIndex = 1;
    this.pageSize = 10;
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();
  }

  showCreateModal() {
    const obj: Partial<Investor> = {
    };
    const { success, error } = this.createInvestorService.createModal(
      '添加Investor',
      obj,
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(
        `添加Investor 成功`,
        `添加Investor 成功`
      );
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`添加Investor 失败`, `${e.message}`);
    });
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

  confirmEdit(item: Investor) {
    const obj: Partial<Investor> = {
      ...item
    };
    const { success, error } = this.createInvestorService.createModal(
      '编辑Investor',
      obj,
      InvestorModalActions.UPDATE
    );

    success.subscribe((v) => {
      this.nzNotificationService.success(
        `编辑Investor 成功`,
        `编辑Investor 成功`
      );
      this.loadDataFromServer();
    });
    error.subscribe((e) => {
      this.nzNotificationService.error(`编辑Investor 失败`, `${e.message}`);
    });
  }

  confirmDelete(item: Investor) {
    this.investorService.deleteByID(item._id).subscribe({
      next: () => {
        this.nzNotificationService.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => { },
      error: (e) => {
        this.nzNotificationService.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: Investor) { }

  private loadDataFromServer(): void {
    this.loading = true;
    this.investorService
      .queryList(
        this.adjustQuery(this.query),
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.items = results;
      });

    this.investorService
      .queryCount(this.adjustQuery(this.query))
      .subscribe((count) => {
        this.total = count;
      });
  }

  private adjustQuery(query: { [key: string]: any }): { [key: string]: any } {
    // name 支持正则查询
    const o: { [key: string]: any } = {};
    Object.keys(query).forEach((key) => {
      if (key === 'name') {
        Object.assign(o, {
          ['name']: { $regex: query['name'].trim(), $options: 'i' },
        });
      } else {
        Object.assign(o, { [key]: query[key] });
      }
    });
    return o;
  }

  private buildSort(sortField?: string | null, sortOrder?: string | null) {
    if (!sortField) {
      return {
        createdAt: -1,
      };
    }

    if (sortField === 'createdAtStr') {
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
