import { Pipe, PipeTransform } from '@angular/core';
import { AirdropJobStatus } from '../models';

@Pipe({
  name: 'airdropJobStatusString',
})
export class AirdropStatusStringPipe implements PipeTransform {
  transform(n: AirdropJobStatus): string {
    switch (n) {
      case AirdropJobStatus.NOT_STARTED:
        return '未开始';
      case AirdropJobStatus.IN_PROGRESS:
        return '进行中';
      case AirdropJobStatus.HAS_ENDED:
        return '已结束';

      default:
        return '未知状态'
    }
  }
}
