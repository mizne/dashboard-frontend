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

// 移除 null undefined ''
export const removeEmpty = (obj: { [key: string]: any }) => {
  const result: { [key: string]: any } = {};
  for (const key of Object.keys(obj)) {
    if (!(isEmpty(obj[key]))) {
      Object.assign(result, {
        [key]: obj[key],
      });
    }
  }
  return result;
};

export function isEmpty(v: any): boolean {
  return isNil(v) || v === '';
}

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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function stringifyMills(ms: number): string {
  ms = Number(ms);
  if (ms !== ms) {
    return '--';
  }

  const oneSecond = 1e3;
  const oneMinute = 60 * oneSecond;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;
  if (ms < oneSecond) {
    return 'just now';
  }
  if (ms < oneMinute) {
    return `${paddingZero(String(Math.floor(ms / oneSecond)))}s`;
  }
  if (ms < oneHour) {
    const minutes = Math.floor(ms / oneMinute);
    const seconds = Math.floor((ms - minutes * oneMinute) / oneSecond);
    return `${paddingZero(String(minutes))}m ${paddingZero(String(seconds))}s`;
  }
  if (ms < oneDay) {
    const hours = Math.floor(ms / oneHour);
    const minutes = Math.floor((ms - hours * oneHour) / oneMinute);
    const seconds = Math.floor(
      (ms - hours * oneHour - minutes * oneMinute) / oneSecond
    );
    return `${paddingZero(String(hours))}h ${paddingZero(
      String(minutes)
    )}m ${paddingZero(String(seconds))}s`;
  }

  const days = Math.floor(ms / oneDay);
  const hours = Math.floor((ms - days * oneDay) / oneHour);
  const minutes = Math.floor(
    (ms - days * oneDay - hours * oneHour) / oneMinute
  );
  const seconds = Math.floor(
    (ms - days * oneDay - hours * oneHour - minutes * oneMinute) / oneSecond
  );
  return `${paddingZero(String(days))}day ${paddingZero(
    String(hours)
  )}h ${paddingZero(String(minutes))}m ${paddingZero(String(seconds))}s`;
}

export function stringifyNumber(n: number): string {
  n = Number(n);
  if (n !== n) {
    return `stringifyNumber() ${n} not a number`;
  }
  const oneWan = 1e4;
  const oneYi = 1e8;

  if (n >= oneYi) {
    return (n / oneYi).toFixed(2) + ' 亿';
  }
  if (n >= oneWan) {
    return (n / oneWan).toFixed(2) + ' 万';
  }

  if (n >= 100) {
    return (n / oneWan).toFixed(2) + ' 万';
  }
  return String(n);
}

export function resolvePriceStatus(
  closeDeltaEma21: number,
  ema21DeltaEma55: number,
  ema55DeltaEma144: number
): 'long' | 'short' | 'shock' {
  return ema21DeltaEma55 >= 0 && ema55DeltaEma144 >= 0
    ? 'long'
    : ema21DeltaEma55 < 0 && ema55DeltaEma144 < 0
      ? 'short'
      : 'shock';
}
