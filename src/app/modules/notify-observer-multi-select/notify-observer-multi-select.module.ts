import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { DragDropModule } from '@angular/cdk/drag-drop'
import { NotifyObserverMultiSelectComponent } from './notify-observer-multi-select.component'
import { CreateNotifyObserverModule } from 'src/app/modules/create-notify-observer';

@NgModule({
  imports: [SharedModule, DragDropModule, CreateNotifyObserverModule],
  exports: [NotifyObserverMultiSelectComponent],
  declarations: [NotifyObserverMultiSelectComponent],
  providers: [],
})
export class NotifyObserverMultiSelectModule { }
