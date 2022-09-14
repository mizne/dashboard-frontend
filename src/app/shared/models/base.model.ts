export type FilterQuery<T> = {
  [P in keyof T]?: any;
};
