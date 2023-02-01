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

const ngZorroConfig: NzConfig = {
  notification: { nzPlacement: 'bottom' }
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
  ],
  providers: [
    { provide: NZ_I18N, useValue: zh_CN },
    { provide: NZ_CONFIG, useValue: ngZorroConfig }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
