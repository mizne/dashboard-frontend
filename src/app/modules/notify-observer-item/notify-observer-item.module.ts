import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { FollowedProjectSelectViewModule } from 'src/app/modules/followed-project-select-view'
import { TaskRecordModalModule } from 'src/app/modules/task-record-modal'
import { NotifyHistoryItemModule } from 'src/app/modules/notify-history-item';
import { NotifyObserverItemComponent } from './notify-observer-item.component'
import { StatisticsChartComponent } from './components/statistics-chart.component'

@NgModule({
  imports: [
    SharedModule,
    FollowedProjectSelectViewModule,
    TaskRecordModalModule,
    NotifyHistoryItemModule
  ],
  exports: [NotifyObserverItemComponent],
  declarations: [NotifyObserverItemComponent, StatisticsChartComponent],
  providers: [],
})
export class NotifyObserverItemModule { }
