import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/overview' },
  {
    path: 'overview',
    loadChildren: () =>
      import('./pages/overview/overview.module').then((m) => m.OverviewModule),
  },
  {
    path: 'cex-future',
    loadChildren: () =>
      import('./pages/cex-future-page/cex-future-page.module').then((m) => m.CexFuturePageModule),
  },
  {
    path: 'fund-raise',
    loadChildren: () =>
      import('./pages/fund-raise/fund-raise.module').then(
        (m) => m.FundRaiseModule
      ),
  },
  {
    path: 'project-statistics',
    loadChildren: () =>
      import('./pages/project-statistics/project-statistics.module').then(
        (m) => m.ProjectStatisticsModule
      ),
  },
  {
    path: 'nft-marketplace',
    loadChildren: () =>
      import('./pages/nft-marketplace/nft-marketplace.module').then(
        (m) => m.NFTMarketplaceModule
      ),
  },
  {
    path: 'my-notification',
    loadChildren: () =>
      import('./pages/my-notification/my-notification.module').then(
        (m) => m.MyNotificationModule
      ),
  },
  {
    path: 'tracking-record',
    loadChildren: () =>
      import('./pages/tracking-record/tracking-record.module').then(
        (m) => m.TrackingRecordModule
      ),
  },
  {
    path: 'followed-project',
    loadChildren: () =>
      import('./pages/followed-project/followed-project.module').then(
        (m) => m.FollowedProjectModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
