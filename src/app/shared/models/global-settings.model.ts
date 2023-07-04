export interface GlobalSettings {
  readonly _id: string;
  defaultKeyOfTwitterNotifyObserver: string;
  defaultTwitterAuthorization?: string;
  defaultTwitterXCsrfToken?: string;
  defaultTwitterCookie?: string;

  readonly createdAt: number;
  readonly createdAtStr: string;
}
