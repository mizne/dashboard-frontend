import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/fund-raise' },
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
