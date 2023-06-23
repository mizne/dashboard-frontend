
export interface NotifyObserverGroup {
  readonly _id: string;

  title?: string;
  desc?: string;

  notifyObserverIDs?: string[];

  readonly createdAt: number;
  readonly createdAtStr: string;
}
