import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { components } from './components';
import { services } from './services';

const nzModules = [
  NzButtonModule,
  NzCardModule,
  NzRadioModule,
  NzSelectModule,
  NzGridModule,
  NzFormModule,
  NzTableModule,
  NzDividerModule,
  NzPopconfirmModule,
  NzNotificationModule,
  NzModalModule,
  NzToolTipModule,
  NzSwitchModule,
  NzSpinModule,
];
const ngModules = [CommonModule, ReactiveFormsModule];

@NgModule({
  imports: [...nzModules, ...ngModules],
  exports: [...nzModules, ...ngModules, ...components],
  declarations: [...components],
  providers: [...services],
})
export class SharedModule {}
