export interface TaskRecord {
  readonly _id: string;
  readonly uuid: string;
  readonly name: string;
  readonly key?: string;
  readonly priority: number;

  readonly startAt: number;
  readonly endAt?: number;
  readonly duration?: number; // 任务从开始到结束的耗时 单位:ms

  readonly errorAt?: number;
  readonly hasError: boolean;
  readonly errorMessage?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
