import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { CreateProjectComponent } from './components/create-project.component';
import { CreateProjectService } from './create-project.service';
@NgModule({
  imports: [SharedModule],
  exports: [CreateProjectComponent],
  declarations: [CreateProjectComponent],
  providers: [CreateProjectService],
})
export class CreateProjectModule {}
