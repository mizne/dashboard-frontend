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
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { components } from './components';
import { services } from './services';
import { pipes } from './pipes';

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
  NzIconModule,
  NzInputModule,
  NzTagModule,
  NzAffixModule,
  NzLayoutModule,
  NzMenuModule,
  NzDropDownModule,
  NzBadgeModule,
  NzInputNumberModule,
  NzTabsModule,
  NzDrawerModule,
  NzCollapseModule,
  NzListModule,
  NzPopoverModule,
];
const ngModules = [CommonModule, ReactiveFormsModule];

@NgModule({
  imports: [...nzModules, ...ngModules],
  exports: [...nzModules, ...ngModules, ...components, ...pipes],
  declarations: [...components, ...pipes],
  providers: [],
})
export class SharedModule {}
