import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateNotifyObserverNotAllowComponent } from './components/create-notify-observer-not-allow.component';
import { CreateNotifyObserverNotAllowService } from './create-notify-observer-not-allow.service';
@NgModule({
  imports: [SharedModule],
  exports: [CreateNotifyObserverNotAllowComponent],
  declarations: [CreateNotifyObserverNotAllowComponent],
  providers: [CreateNotifyObserverNotAllowService],
})
export class CreateNotifyObserverNotAllowModule { }
