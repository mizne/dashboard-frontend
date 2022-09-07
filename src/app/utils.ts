import { format, parse } from 'date-fns';

export const removeNullOrUndefined = (obj: { [key: string]: any }) => {
  const result: { [key: string]: any } = {};
  for (const key of Object.keys(obj)) {
    if (!isNil(obj[key])) {
      Object.assign(result, {
        [key]: obj[key],
      });
    }
  }
  return result;
};

export function isNil(v: any): boolean {
  return isNull(v) || isUndefined(v);
}

export function isNull(v: any): boolean {
  return v === null;
}

export function isUndefined(v: any): boolean {
  return v === undefined;
}

export function isObject(v: any): boolean {
  return typeof v === 'object' && v !== null;
}

// 返回当天的零时零分零秒的 时间戳
export function today(): number {
  return parse(
    format(new Date(), 'yyyy-MM-dd'),
    'yyyy-MM-dd',
    new Date()
  ).getTime();
}

// 返回 小时 零分零秒的 时间戳
export function currentHour(): number {
  return parse(
    format(new Date(), 'yyyy-MM-dd HH') + ':00:00',
    'yyyy-MM-dd HH:mm:ss',
    new Date()
  ).getTime();
}

// 补零
export function paddingZero(s: string, length = 2): string {
  return s.length < length ? `${'0'.repeat(length - s.length)}${s}` : s;
}
