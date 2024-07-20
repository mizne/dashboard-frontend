import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_CN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconsProviderModule } from './icons-provider.module';
import { SharedModule } from './shared/shared.module';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { NotifyHistoryModule } from 'src/app/modules/notify-history';
import { TimerNotifyObserverModalModule } from 'src/app/modules/timer-notify-observer';
import { TaskRecordModalModule } from 'src/app/modules/task-record-modal';
import { CexTokenItemDetailModule } from 'src/app/modules/cex-token-item-detail';
import { CexFutureItemDetailModule } from 'src/app/modules/cex-future-item-detail';
import { CexTokenPriceChangeStatisticsModule } from 'src/app/modules/cex-token-price-change-statistics';
import { CexTokenListModule } from 'src/app/modules/cex-token-list';
import { CexFutureListModule } from 'src/app/modules/cex-future-list';

const ngZorroConfig: NzConfig = {
  notification: { nzPlacement: 'bottomLeft' }
};

registerLocaleData(zh);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    SharedModule,
    NotifyHistoryModule,
    TimerNotifyObserverModalModule,
    TaskRecordModalModule,
    CexTokenItemDetailModule,
    CexFutureItemDetailModule,
    CexTokenPriceChangeStatisticsModule,
    CexTokenListModule,
    CexFutureListModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: zh_CN },
    { provide: NZ_CONFIG, useValue: ngZorroConfig }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
