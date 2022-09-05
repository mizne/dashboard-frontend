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
