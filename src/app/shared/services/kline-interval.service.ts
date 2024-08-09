import { Injectable } from '@angular/core';
import { format, parse } from 'date-fns';
import { paddingZero } from 'src/app/utils';

@Injectable({ providedIn: 'root' })
export class KlineIntervalService {
  constructor() { }

  public static readonly FOUR_HOURS_MILLS = 4 * 60 * 60 * 1e3;
  public static readonly ONE_DAY_MILLS = 24 * 60 * 60 * 1e3;
  resolveFourHoursIntervalMills(latestIntervals: number): number {
    const fourHours = 4 * 60 * 60 * 1e3;
    const hours = [0, 4, 8, 12, 16, 20];
    const currentHour = new Date().getHours();
    const theHourIndex = hours.findIndex((e) => e > currentHour);
    const theHour =
      theHourIndex >= 0 ? hours[theHourIndex - 1] : hours[hours.length - 1];

    const theMills = parse(
      format(new Date(), 'yyyy-MM-dd') +
      ` ${paddingZero(String(theHour))}:00:00`,
      'yyyy-MM-dd HH:mm:ss',
      new Date()
    ).getTime();

    return theMills - (latestIntervals - 1) * fourHours;
  }

  resolveOneDayIntervalMills(latestIntervals: number): number {
    const oneDay = 24 * 60 * 60 * 1e3;
    const currentHour = new Date().getHours();
    if (currentHour >= 8) {
      // 返回当天08:00:00的时间戳 及天数差值
      return (
        parse(
          format(new Date(), 'yyyy-MM-dd') + ' 08:00:00',
          'yyyy-MM-dd HH:mm:ss',
          new Date()
        ).getTime() -
        (latestIntervals - 1) * oneDay
      );
    } else {
      // 返回前一天08:00:00的时间戳 及天数差值
      return (
        parse(
          format(new Date().getTime() - oneDay, 'yyyy-MM-dd') + ' 08:00:00',
          'yyyy-MM-dd HH:mm:ss',
          new Date()
        ).getTime() -
        (latestIntervals - 1) * oneDay
      );
    }
  }
}
