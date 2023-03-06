import { Injector, NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { FollowedProjectSelectModule } from 'src/app/modules/followed-project-select'
import { components, directives, services } from './components';
import { CreateNotifyObserverService } from './create-notify-observer.service';
import { NotifyObserverTypeManagerService } from './notify-observer-type-manager.service';

@NgModule({
  imports: [SharedModule, FollowedProjectSelectModule],
  exports: [],
  declarations: [...components, ...directives],
  providers: [CreateNotifyObserverService, NotifyObserverTypeManagerService, ...services],
})
export class CreateNotifyObserverModule {
  constructor(private injector: Injector) {
    services.forEach(s => {
      // 自动注入service
      this.injector.get(s)
    })
  }
}
