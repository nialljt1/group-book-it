import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'dateFormatPipe'
})
export class DateFormatPipe implements PipeTransform {
    transform(value: string) {
       const datePipe = new DatePipe('en-US');
        value = datePipe.transform(value, 'dd MMM yyyy');
        return value;
    }
}

@Pipe({
    name: 'timeFormatPipe',
})

export class TimeFormatPipe implements PipeTransform {
    transform(value: string) {
       const datePipe = new DatePipe('en-US');
        value = datePipe.transform(value, 'hh:mm');
        return value;
    }
}



