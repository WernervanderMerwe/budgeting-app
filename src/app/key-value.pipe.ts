import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'description' })
export class DescriptionPipe implements PipeTransform {
  transform(value: any) {
    return value.description;
  }
}

@Pipe({ name: 'amount' })
export class AmountPipe implements PipeTransform {
  transform(value: any) {
    return value.amount;
  }
}
