import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'passwordString',
})
export class PasswordStringPipe implements PipeTransform {
  transform(n?: string): string {
    n = n || '';

    return `${n.slice(0, 2)}***${n.slice(-2)}`
  }
}
