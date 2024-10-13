import { Component, OnInit } from '@angular/core';
import { ClientNotifyService, TaskRecordService } from '../../services';
import { lastValueFrom } from 'rxjs';
import { memorizeFn } from 'src/app/utils';

@Component({
  selector: 'network-checker',
  templateUrl: 'network-checker.component.html',
})
export class NetworkCheckerComponent implements OnInit {
  constructor(
    private readonly clientNotifyService: ClientNotifyService,
    private readonly taskRecordService: TaskRecordService,
  ) { }

  tasks: Array<{
    id: string;
    name: string;
    key: string;
    priority: number;
    progress: string;
    startAt: number;

    avgCostTime: number;
  }> = [];

  visible = false

  ngOnInit() {
    this.clientNotifyService.listenRunningTasks().subscribe(async (data) => {
      const tasks = data.payload.tasks;

      // 对已存在的任务更新任务进度 对新的任务进行添加
      for (const t of tasks) {
        const the = this.tasks.find(e => e.id === t.id);
        if (the) {
          the.progress = t.progress;
        } else {
          this.tasks.push({
            id: t.id,
            name: t.name,
            key: t.key,
            priority: t.priority,
            progress: t.progress,
            startAt: t.startAt,

            avgCostTime: 0
          })
        }
      }

      // 移除已经结束的任务
      this.tasks = this.tasks.filter(e => !!tasks.find(f => f.id === e.id))

      for (const t of this.tasks) {
        const avgCostTime = await this.avgCostTimeResolver(t.name, t.key)
        t.avgCostTime = avgCostTime
      }
    });
  }

  private avgCostTimeResolver: (name: string, key: string) => Promise<number> = memorizeFn(this.computeAvgCostTime.bind(this))

  private async computeAvgCostTime(name: string, key: string): Promise<number> {
    const items = await lastValueFrom(this.taskRecordService.queryList({
      name, key, duration: { $gt: 0 }, hasError: false
    }, { number: 1, size: 20 }))

    if (items.length > 0) {
      const total = items.reduce((accu, curr) => accu + (curr.duration || 0), 0)
      return total / items.length
    }

    return 0;
  }
}
