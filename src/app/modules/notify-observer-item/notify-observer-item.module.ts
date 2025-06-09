import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { FollowedProjectSelectViewModule } from 'src/app/modules/followed-project-select-view'
import { TaskRecordModalModule } from 'src/app/modules/task-record-modal'
import { NotifyHistoryModalModule } from 'src/app/modules/notify-history-modal';
import { CexTokenItemDetailModule } from 'src/app/modules/cex-token-item-detail';
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail';
import { NotifyObserverItemComponent } from './notify-observer-item.component'
import { StatisticsChartComponent } from './components/statistics-chart.component'

@NgModule({
  imports: [
    SharedModule,
    FollowedProjectSelectViewModule,
    TaskRecordModalModule,
    NotifyHistoryModalModule,
    CexTokenItemDetailModule,
    CexFutureItemDetailModule,
  ],
  exports: [NotifyObserverItemComponent],
  declarations: [NotifyObserverItemComponent, StatisticsChartComponent],
  providers: [],
})
export class NotifyObserverItemModule { }
