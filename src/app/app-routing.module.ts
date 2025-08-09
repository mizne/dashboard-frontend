import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/my-notify-observer-group' },
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
    path: 'cex-token',
    loadChildren: () =>
      import('./pages/cex-token-page/cex-token-page.module').then((m) => m.CexTokenPageModule),
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
    path: 'my-notify-observer-group',
    loadChildren: () =>
      import('./pages/my-notify-observer-group/my-notify-observer-group.module').then(
        (m) => m.MyNotifyObserverGroupModule
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
  {
    path: 'airdrop-job',
    loadChildren: () =>
      import('./pages/airdrop-job/airdrop-job.module').then(
        (m) => m.AirdropJobModule
      ),
  },
  {
    path: 'airdrop-account',
    loadChildren: () =>
      import('./pages/airdrop-account/airdrop-account.module').then(
        (m) => m.AirdropAccountModule
      ),
  },
  {
    path: 'airdrop-interaction-record',
    loadChildren: () =>
      import('./pages/airdrop-interaction-record/airdrop-interaction-record.module').then(
        (m) => m.AirdropInteractionRecordModule
      ),
  },
  {
    path: 'magpie-helper',
    loadChildren: () =>
      import('./pages/magpie-helper/magpie-helper.module').then(
        (m) => m.MagpieHelperModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
