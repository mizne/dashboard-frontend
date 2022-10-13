import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateNotifyObserverComponent } from './components/create-notify-observer.component';
import { CreateNotifyObserverService } from './create-notify-observer.service';
@NgModule({
  imports: [SharedModule],
  exports: [CreateNotifyObserverComponent],
  declarations: [CreateNotifyObserverComponent],
  providers: [CreateNotifyObserverService],
})
export class CreateNotifyObserverModule {}
