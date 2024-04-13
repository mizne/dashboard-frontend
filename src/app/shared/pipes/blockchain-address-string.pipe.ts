import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'blockchainAddressString',
})
export class BlockchainAddressStringPipe implements PipeTransform {
  transform(n?: string): string {
    n = n || '';

    return `${n.slice(0, 6)}...${n.slice(-6)}`
  }
}
