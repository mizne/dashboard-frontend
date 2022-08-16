import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FundRaise } from './models/fund-raise.model';
import { FundRaiseService } from './services/fund-raise.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormBuilder, FormGroup } from '@angular/forms';
import { removeNullOrUndefined } from 'src/app/utils';
import validator from 'validator';
import * as uuid from 'uuid';

interface Project {
  name: string;
  website: string;
  investors: string[];
}

@Component({
  selector: 'app-fund-raise',
  templateUrl: './fund-raise.component.html',
  styleUrls: ['./fund-raise.component.less'],
})
export class FundRaiseComponent implements OnInit {
  constructor(
    private readonly fundRaiseService: FundRaiseService,
    private readonly notification: NzNotificationService,
    private readonly fb: FormBuilder
  ) {}

  total = 1;
  fundRaises: FundRaise[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  query: { [key: string]: any } = {};
  sort: any = {
    createdAt: -1,
  };

  investors = [
    {
      name: 'a16z',
    },
    {
      name: 'binance_labs',
    },
    {
      name: 'multicoin_capital',
    },
    {
      name: 'coinbase_ventures',
    },
    {
      name: 'animoca_brands',
    },
    {
      name: 'sequioa_capital_india',
    },
    {
      name: 'delphi_digital',
    },
    {
      name: 'alameda_research',
    },
    {
      name: 'paradigm',
    },
    {
      name: 'ftx_ventures',
    },
  ];

  form = this.fb.group({
    investorName: [null],
    projectName: [null],
  });

  isVisible = false;
  projects: Project[] = [];
  modalLoading = false;

  submitForm(): void {
    console.log('submitForm', this.form.value);
    this.query = removeNullOrUndefined(this.form.value);
    this.loadDataFromServer();
  }

  resetForm() {
    this.form.reset();
    console.log('resetForm', this.form.value);
    this.query = removeNullOrUndefined(this.form.value);
    this.loadDataFromServer();
  }

  ngOnInit(): void {
    this.loadDataFromServer();
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log('onQueryParamsChange ', params);
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sort = this.buildSort(sortField, sortOrder);
    this.loadDataFromServer();
  }

  confirmDelete(item: FundRaise) {
    console.log(`confirmDelete(): `, item);
    this.fundRaiseService.deleteByID(item._id).subscribe({
      next: () => {
        this.notification.success(`删除成功`, `删除数据成功`);
        this.loadDataFromServer();
      },
      complete: () => {},
      error: (e) => {
        this.notification.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }

  cancelDelete(item: FundRaise) {}

  toLink(link: string) {
    if (validator.isURL(link)) {
      window.open(link.startsWith('http') ? link : `https://${link}`, '_blank');
    } else {
      console.log(`toLink() not a url, ${link}`);
      this.notification.warning(`非法URL`, `不是合法URL`);
    }
  }

  showModal() {
    this.isVisible = true;

    this.fetchAllFundRaiseAndAnalysis();
  }
  handleCancel() {
    this.isVisible = false;
  }
  handleOk() {
    this.isVisible = false;
  }

  private loadDataFromServer(): void {
    this.loading = true;
    this.fundRaiseService
      .queryList(
        this.query,
        { number: this.pageIndex, size: this.pageSize },
        this.sort
      )
      .subscribe((results) => {
        this.loading = false;
        this.fundRaises = results;
      });

    this.fundRaiseService.queryCount(this.query).subscribe((count) => {
      this.total = count;
    });
  }

  private buildSort(sortField?: string | null, sortOrder?: string | null) {
    if (!sortField) {
      return {
        createdAt: -1,
      };
    }

    if (sortField === 'investDateStr' || sortField === 'createdAtStr') {
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

  private fetchAllFundRaiseAndAnalysis() {
    this.modalLoading = true;

    this.fundRaiseService.queryList({}).subscribe({
      next: (items) => {
        this.modalLoading = false;
        const projects: Project[] = [];
        for (const item of items) {
          const theProject = projects.find(
            (e) => e.website === item.projectWebsite
          );
          if (theProject) {
            theProject.investors.push(item.investorName);
          } else {
            projects.push({
              name: item.projectName,
              website: item.projectWebsite,
              investors: [item.investorName],
            });
          }
        }

        this.projects = projects.sort(
          (a, b) => b.investors.length - a.investors.length
        );
      },
      complete: () => {},
      error: () => {
        this.modalLoading = false;
        this.notification.error(`获取失败`, `获取全部融资信息失败`);
      },
    });
  }
}
