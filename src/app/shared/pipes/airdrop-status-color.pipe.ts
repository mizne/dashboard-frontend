import { Pipe, PipeTransform } from '@angular/core';
import { AirdropJobStatus } from '../models';

@Pipe({
  name: 'airdropJobStatusColor',
})
export class AirdropStatusColorPipe implements PipeTransform {
  transform(n: AirdropJobStatus): string {
    switch (n) {
      case AirdropJobStatus.NOT_STARTED:
        return 'warning';
      case AirdropJobStatus.IN_PROGRESS:
        return 'success';
      case AirdropJobStatus.HAS_ENDED:
        return 'error';

      default:
        return 'default'
    }
  }
}
