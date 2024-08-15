import { format, parse } from 'date-fns';
import { UTCTimestamp } from 'lightweight-charts';

export const colors = [
  '#f23645',
  '#ff9800',
  '#ffeb3b',
  '#4caf50',
  '#089981',
  '#00bcd4',
  '#2962ff',
  '#673ab7',
  '#9c27b0',
  '#e91e63',
]
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

// 移除 keys
export const removeKeys = (obj: { [key: string]: any }, keys: string[]) => {
  const result: { [key: string]: any } = {};
  for (const key of Object.keys(obj)) {
    if (keys.indexOf(key) === -1) {
      Object.assign(result, {
        [key]: obj[key],
      });
    }
  }
  return result;
};

export function memorizeFn<T>(
  fn: (...args: any[]) => T,
  resolver?: (...args: any[]) => string,
  cache?: {
    set: (k: string, v: any) => void;
    get: (k: string) => any;
    has: (k: string) => boolean;
  },
  debug?: (key: string, hitCount: number) => void
): (...args: any[]) => T {
  const map = cache || new Map();
  let hitCount = 0;
  const memorizedFn = function (...args: any[]) {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    if (map.has(key)) {
      hitCount += 1;
      debug && debug(key, hitCount)
      return map.get(key);
    }
    const res = fn.apply(null, args);
    map.set(key, res);
    return res;
  };
  memorizedFn.cache = map;
  return memorizedFn;
}

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
export function currentHour(d?: Date | number): number {
  return parse(
    format(d || new Date(), 'yyyy-MM-dd HH') + ':00:00',
    'yyyy-MM-dd HH:mm:ss',
    new Date()
  ).getTime();
}

// 补零
export function paddingZero(s: string, length = 2): string {
  return s.length < length ? `${'0'.repeat(length - s.length)}${s}` : s;
}

// 追加空格
export function appendBlank(s: string, length = 2): string {
  return s.length < length ? `${s}${' '.repeat(length - s.length)}` : s;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

interface SkipOptions {
  skipSecond?: boolean;
  skipMinute?: boolean;
  skipHour?: boolean;
}

export function stringifyMills(ms: number, options: SkipOptions = {
  skipSecond: false,
  skipMinute: false,
  skipHour: false,
}): string {
  const skipSecond = isNil(options.skipSecond) ? true : options.skipSecond;
  const skipMinute = isNil(options.skipMinute) ? false : options.skipMinute;
  const skipHour = isNil(options.skipHour) ? false : options.skipHour;
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
    return `${paddingZero(String(minutes))}m` + (skipSecond ? '' : ` ${paddingZero(String(seconds))}s`);
  }
  if (ms < oneDay) {
    const hours = Math.floor(ms / oneHour);
    const minutes = Math.floor((ms - hours * oneHour) / oneMinute);
    const seconds = Math.floor(
      (ms - hours * oneHour - minutes * oneMinute) / oneSecond
    );

    return `${paddingZero(String(hours))}h` + (
      skipMinute ? '' : `${paddingZero(String(minutes))}m`
    )
  }

  const days = Math.floor(ms / oneDay);
  const hours = Math.floor((ms - days * oneDay) / oneHour);
  const minutes = Math.floor(
    (ms - days * oneDay - hours * oneHour) / oneMinute
  );
  const seconds = Math.floor(
    (ms - days * oneDay - hours * oneHour - minutes * oneMinute) / oneSecond
  );

  return `${paddingZero(String(days))}day` + (
    skipHour ? '' : `${paddingZero(String(hours))}h`
  )
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


export function fixTradingViewTime(time: number): UTCTimestamp {
  return (time / 1e3 + 8 * 60 * 60) as UTCTimestamp
}

export function randomString(length: number): string {
  const total =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  return Array.from({ length }, () => randomEleInArr(total.split(''))).join('');
}

export function randomEleInArr<T>(arr: T[]): T {
  const rndIndex = Math.floor(Math.random() * arr.length);
  return arr[rndIndex];
}

export function group<T>(arr: T[], groupCount: number): T[][] {
  const results: T[][] = [];

  for (const e of arr) {
    if (results.length === 0) {
      results.push([e])
    } else {
      if (results[results.length - 1].length === groupCount) {
        results.push([e])
      } else {
        results[results.length - 1].push(e)
      }
    }
  }

  return results;
}