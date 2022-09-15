export type FilterQuery<T> = {
  [P in keyof T]?: any;
};

export enum DailyInterval {
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
}
