import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

const nzModules = [
  NzButtonModule,
  NzCardModule,
  NzRadioModule,
  NzSelectModule,
  NzGridModule,
];
const ngModules = [CommonModule, ReactiveFormsModule];

@NgModule({
  imports: [...nzModules, ...ngModules],
  exports: [...nzModules, ...ngModules],
  declarations: [],
  providers: [],
})
export class SharedModule {}
