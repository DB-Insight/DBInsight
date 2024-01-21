export interface IDBDriver {
  connect(): Promise<void>;
  destroy(): Promise<void>;
  raw(sql: string): Promise<any>;
  getVersion(): Promise<string>;
  showDatabases(): Promise<IDatabase[]>;
  showTables(): Promise<ITable[]>;
}

export interface IDatabase {
  name: string;
}

export interface ITable {
  name: string;
}
