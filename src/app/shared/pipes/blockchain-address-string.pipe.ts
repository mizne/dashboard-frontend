import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'blockchainAddressString',
})
export class BlockchainAddressStringPipe implements PipeTransform {
  transform(n?: string, sliceCount = 6): string {
    n = n || '';

    return `${n.slice(0, sliceCount)}...${n.slice(-sliceCount)}`
  }
}
