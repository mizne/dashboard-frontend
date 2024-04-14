import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { AirdropAccountAttendJob, AirdropAccountAttendJobService, NotifyHistory, NotifyHistoryService, NotifyObserver, NotifyObserverNotAllow, NotifyObserverTypes, SharedService } from 'src/app/shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CreateAirdropAccountAttendJobService } from 'src/app/modules/create-airdrop-account-attend-job';

interface TableItem extends AirdropAccountAttendJob {
  airdropAccountIDCtrl: FormControl;
}

@Component({
  selector: 'airdrop-account-attend-job-manager-for-job',
  templateUrl: 'airdrop-account-attend-job-manager-for-job.component.html'
})

export class AirdropAccountAttendJobManagerForJobComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly sharedService: SharedService,
    private readonly notificationService: NzNotificationService,
    private readonly createAttendJobService: CreateAirdropAccountAttendJobService,
    private readonly airdropAccountAttendJobService: AirdropAccountAttendJobService,
  ) { }

  @Input() airdropJobID: string | null = null;

  attendJobs: TableItem[] = [];
  loadingAttendJobs = false;

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.fetchAirdropAccountAttendJobs();
  }


  private fetchAirdropAccountAttendJobs() {
    if (!this.airdropJobID) {
      return
    }

    this.loadingAttendJobs = true;
    this.airdropAccountAttendJobService.queryList({ airdropJobID: this.airdropJobID })
      .subscribe({
        next: (items: AirdropAccountAttendJob[]) => {
          this.loadingAttendJobs = false;
          if (items.length > 0) {
            this.attendJobs = items.map((e) => ({
              ...e,
              airdropAccountIDCtrl: new FormControl(e.airdropAccountID)
            }))
          } else {
            this.attendJobs = [];
            this.notificationService.warning(`没有找到 参加任务`, `也许该空投任务还没有账号参加`)
          }
        },
        complete: () => { },
        error: (err: Error) => {
          this.loadingAttendJobs = false;
          this.notificationService.error(`获取 参加任务 失败`, `${err.message}`)
        }
      })
  }

  showCreateAttendJobModal() {
    if (!this.airdropJobID) {
      return;
    }
    const obj: Partial<AirdropAccountAttendJob> = {
      airdropJobID: this.airdropJobID
    };
    const { success, error } = this.createAttendJobService.createModal(
      '参加任务',
      obj,
    );

    success.subscribe((v) => {
      this.notificationService.success(`参加任务成功`, `参加任务成功`);
      this.fetchAirdropAccountAttendJobs();
    });
    error.subscribe((e) => {
      this.notificationService.error(`参加任务失败`, `${e.message}`);
    });
  }


  confirmDeleteAttendJob(item: AirdropAccountAttendJob) {
    this.airdropAccountAttendJobService.deleteByID(item._id).subscribe({
      next: () => {
        this.notificationService.success(`删除成功`, `删除数据成功`);
        this.fetchAirdropAccountAttendJobs();
      },
      complete: () => { },
      error: (e) => {
        this.notificationService.error(`删除失败`, `请稍后重试，${e.message}`);
      },
    });
  }
}