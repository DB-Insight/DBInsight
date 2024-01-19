export interface IDBDriver {
  raw(sql: string): Promise<any>;
}
